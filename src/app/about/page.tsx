"use client";

import { useI18n } from "@/lib/i18n/context";
import { ShieldCheck, EyeOff, Users, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
  const { locale } = useI18n();
  const isBn = locale === "bn";

  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
      <h1 className="text-display-md animate-fade-in-up text-[var(--color-primary)]">
        {isBn ? "সতর্ক সম্পর্কে" : "About Sotorko"}
      </h1>
      <p
        className="animate-fade-in-up mt-5 text-lg leading-relaxed text-[var(--color-text-secondary)]"
        style={{ animationDelay: "60ms" }}
      >
        {isBn
          ? "সতর্ক ঢাকার নারীদের জন্য একটি অলাভজনক, ক্রাউডসোর্সড নিরাপত্তা মানচিত্র। আমাদের লক্ষ্য নারীদের নিরাপত্তা তথ্য দিয়ে সজ্জিত করা, যাতে তারা সতর্কতার সাথে চলাচল করতে পারেন এবং জনসাধারণের মধ্যে সচেতনতা তৈরি করতে পারে।"
          : "Sotorko is a non-profit, crowdsourced safety map built for women navigating Dhaka. Our mission is to give women the safety information they need to move through the city with awareness — and to build public pressure for safer public spaces."}
      </p>

      <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <InfoCard
          icon={<EyeOff size={19} />}
          title={isBn ? "সম্পূর্ণ বেনামী" : "Fully anonymous"}
          body={
            isBn
              ? "কোনো অ্যাকাউন্ট বা লগইন প্রয়োজন নেই। আমরা কখনো আপনার নাম, ফোন নম্বর বা ইমেইল সংগ্রহ করি না।"
              : "No accounts, no login. We never collect your name, phone number, or email address."
          }
          delay={0}
        />
        <InfoCard
          icon={<ShieldCheck size={19} />}
          title={isBn ? "গোপনীয়তা অগ্রাধিকার" : "Privacy by design"}
          body={
            isBn
              ? "সঠিক অবস্থান শুধুমাত্র আপনার সম্মতিতে সংগ্রহ করা হয়। ছবির মেটাডেটা মুছে ফেলা হয় এবং মুখ স্বয়ংক্রিয়ভাবে ঝাপসা করা হয়।"
              : "Precise location is only ever collected with your explicit consent. Photo metadata is stripped and faces are automatically blurred."
          }
          delay={70}
        />
        <InfoCard
          icon={<Users size={19} />}
          title={isBn ? "সম্প্রদায়-চালিত" : "Community-driven"}
          body={
            isBn
              ? "প্রতিটি রিপোর্ট অন্য নারীদের সচেতন সিদ্ধান্ত নিতে সাহায্য করে। আপনার অভিজ্ঞতা অন্যদের নিরাপদ রাখতে সাহায্য করে।"
              : "Every report helps another woman make an informed decision. Your experience helps keep others safe."
          }
          delay={140}
        />
        <InfoCard
          icon={<Scale size={19} />}
          title={isBn ? "আইনি ও নৈতিক সীমানা" : "Legal & ethical boundaries"}
          body={
            isBn
              ? "সতর্ক নির্দিষ্ট ব্যক্তিদের নাম প্রকাশের অনুমতি দেয় না। আমরা অনিরাপদ স্থান চিহ্নিত করি, ব্যক্তিগত অভিযোগ নয়।"
              : "Sotorko does not allow naming specific individuals. We document unsafe locations, not personal accusations — that is a matter for law enforcement."
          }
          delay={210}
        />
      </div>

      <section id="privacy" className="mt-16 scroll-mt-24">
        <h2 className="text-display-sm text-[var(--color-primary)]">
          {isBn ? "গোপনীয়তা নীতি" : "Privacy policy"}
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            {isBn
              ? "আমরা কোনো ব্যক্তিগত তথ্য সংগ্রহ করি না। জিপিএস অবস্থান শুধুমাত্র সুস্পষ্ট সম্মতিতে সংগ্রহ করা হয় এবং ব্যবহারকারীরা পরিবর্তে একটি এলাকা বা মানচিত্রে ম্যানুয়াল পিন বেছে নিতে পারেন।"
              : "We do not collect personal information. GPS location is only collected with explicit consent, and users can instead choose a neighborhood or drop a manual pin on the map."}
          </p>
          <p>
            {isBn
              ? "আপলোড করা ছবিগুলি শুধুমাত্র মডারেটরদের কাছে দৃশ্যমান — কখনো প্রকাশ্যে প্রকাশিত হয় না। সমস্ত মেটাডেটা (জিপিএস সহ) আপলোডের আগে মুছে ফেলা হয় এবং মুখ স্বয়ংক্রিয়ভাবে ঝাপসা করা হয়।"
              : "Uploaded photos are only ever visible to moderators — never published publicly. All metadata (including GPS data) is stripped before upload, and faces are automatically blurred."}
          </p>
          <p>
            {isBn
              ? "প্রতিটি রিপোর্টের সাথে একটি এডিট কোড দেওয়া হয়, যা শুধুমাত্র আপনার ডিভাইসে প্রদর্শিত হয়। আমরা এই কোডটি কখনো প্লেইনটেক্সটে সংরক্ষণ করি না — শুধুমাত্র একটি হ্যাশ সংরক্ষণ করি।"
              : "Every report comes with an edit code, shown only on your device. We never store this code in plaintext — only a one-way hash — so even we cannot recover it if lost."}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-display-sm text-[var(--color-primary)]">
          {isBn ? "মডারেশন নীতিমালা" : "Moderation guidelines"}
        </h2>
        <div className="mt-4 space-y-3 text-sm leading-relaxed text-[var(--color-text-secondary)]">
          <p>
            {isBn
              ? "রিপোর্টগুলি সাধারণত অবিলম্বে প্রকাশিত হয়। একটি ডিভাইস থেকে অস্বাভাবিকভাবে ঘন ঘন জমা দেওয়া রিপোর্টগুলি স্বয়ংক্রিয়ভাবে পর্যালোচনার জন্য চিহ্নিত করা হয়।"
              : "Reports are published immediately by default. Reports submitted unusually frequently from a single device are automatically flagged for review."}
          </p>
          <p>
            {isBn
              ? "রিপোর্টগুলি নির্দিষ্ট ব্যক্তি বা ব্যবসার নাম উল্লেখ করতে পারে না। এই ধরনের বিষয়বস্তু পর্যালোচনার জন্য চিহ্নিত করা হয় এবং সরিয়ে ফেলা হতে পারে।"
              : "Reports may not name specific individuals or businesses. Such content is flagged for review and may be removed."}
          </p>
          <p>
            {isBn
              ? "একটি ব্যবসা বা প্রতিষ্ঠান যদি প্রসঙ্গ প্রদান করতে চায়, তারা আমাদের সাথে যোগাযোগ করতে পারে। আমরা রিপোর্ট সরিয়ে ফেলি না শুধুমাত্র কারো অসন্তুষ্টির কারণে — এটি প্ল্যাটফর্মের উদ্দেশ্যকে ক্ষুণ্ন করবে।"
              : "A business or establishment wishing to provide context may contact us. We do not remove reports simply because someone is unhappy with them — doing so would undermine the platform's purpose."}
          </p>
        </div>
      </section>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  body,
  delay,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  delay: number;
}) {
  return (
    <Card
      className="animate-fade-in-up transition-transform duration-[var(--duration-base)] hover:-translate-y-0.5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] text-white">
        {icon}
      </div>
      <h3 className="text-heading mt-4 text-[var(--color-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-secondary)]">
        {body}
      </p>
    </Card>
  );
}
