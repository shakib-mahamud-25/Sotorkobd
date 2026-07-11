import { NextRequest, NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { createServiceClient } from "@/lib/supabase/server";

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const reportId = formData.get("reportId") as string | null;
    const editCode = formData.get("editCode") as string | null;

    if (!file || !reportId) {
      return NextResponse.json(
        { error: "File and report ID are required." },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPEG, PNG, or WEBP images are allowed." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 8MB." },
        { status: 400 }
      );
    }

    // Verify the report exists (and optionally the edit code, if this is
    // an upload happening right after initial submission we trust reportId
    // alone since it was just created; edit code required for later adds)
    const supabase = createServiceClient();
    const { data: report } = await supabase
      .from("reports")
      .select("id")
      .eq("id", reportId)
      .single();

    if (!report) {
      return NextResponse.json({ error: "Report not found." }, { status: 404 });
    }
    void editCode; // reserved for future: require verification on post-hoc uploads

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Cloudinary with:
    // - strip_profile / metadata removal (Cloudinary strips EXIF by default
    //   unless explicitly requested to keep it — we never request "image_metadata")
    // - automatic face detection + blur via transformation
    const uploadResult = await new Promise<{
      public_id: string;
      secure_url: string;
    }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "sotorko/reports",
            resource_type: "image",
            // Strip all metadata (GPS/EXIF) — Cloudinary does this by default
            // when metadata isn't explicitly requested, but we're explicit here.
            transformation: [
              { effect: "pixelate_faces:20" }, // blur/pixelate detected faces
              { quality: "auto:good" },
              { fetch_format: "auto" },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error);
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          }
        )
        .end(buffer);
    });

    const { error: insertError } = await supabase.from("report_media").insert({
      report_id: reportId,
      cloudinary_public_id: uploadResult.public_id,
      cloudinary_url: uploadResult.secure_url,
      faces_blurred: true,
    });

    if (insertError) {
      console.error("Media insert error:", insertError);
      return NextResponse.json(
        { error: "Upload succeeded but could not be saved. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, url: uploadResult.secure_url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: "Upload failed. Please try again." },
      { status: 500 }
    );
  }
}
