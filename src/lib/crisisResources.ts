// Crisis/safety resource data. Kept as a separate data file (not inline in
// the component) so updating a number or adding a resource later is a
// one-file edit, not a component-logic change.
//
// Sourcing note: 999 and 109 are both government-published national
// numbers, cross-confirmed against multiple independent sources (The Daily
// Star, mspvaw.gov.bd — the Ministry of Women and Children Affairs'
// Multi-Sectoral Programme on Violence Against Women) as of August 2026.
// Both are included with confidence.
//
// A third resource, Bangladesh Mahila Parishad (a long-established
// women's rights organization with a legal aid arm), is included as a
// named organization with a link to their own site rather than a phone
// number sourced from a search result — a specific mobile number found via
// search is not something to publish as a verified public helpline in a
// safety-critical context without a more authoritative source than a news
// mention. If you want to add a directly-dialable BMP number, verify it
// against mahilaparishad.org or by calling first, then add it here.
//
// Review this file periodically — helpline numbers and organizations can
// change. Last verified: August 2026.

export interface CrisisResource {
  id: string;
  name_en: string;
  name_bn: string;
  description_en: string;
  description_bn: string;
  phone?: string; // only set when confidently sourced — see note above
  url?: string;
  availability_en: string;
  availability_bn: string;
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    id: "national-emergency",
    name_en: "National Emergency Service",
    name_bn: "জাতীয় জরুরি সেবা",
    description_en:
      "For immediate danger — police, fire, or medical emergency.",
    description_bn: "তাৎক্ষণিক বিপদের ক্ষেত্রে — পুলিশ, ফায়ার সার্ভিস বা মেডিকেল জরুরি সেবার জন্য।",
    phone: "999",
    availability_en: "24/7, free, nationwide",
    availability_bn: "সার্বক্ষণিক, বিনামূল্যে, সারাদেশে",
  },
  {
    id: "vaw-helpline",
    name_en: "National Helpline for Violence Against Women & Children",
    name_bn: "নারী ও শিশু নির্যাতন প্রতিরোধে জাতীয় হেল্পলাইন",
    description_en:
      "Run by the Ministry of Women and Children Affairs. For harassment, abuse, or violence — provides guidance and can connect you to local support.",
    description_bn:
      "মহিলা ও শিশু বিষয়ক মন্ত্রণালয় পরিচালিত। হয়রানি, নির্যাতন বা সহিংসতার ক্ষেত্রে — দিকনির্দেশনা দেয় এবং স্থানীয় সহায়তার সাথে যুক্ত করতে পারে।",
    phone: "109",
    availability_en: "24/7, toll-free, nationwide",
    availability_bn: "সার্বক্ষণিক, টোল-ফ্রি, সারাদেশে",
  },
  {
    id: "mahila-parishad",
    name_en: "Bangladesh Mahila Parishad",
    name_bn: "বাংলাদেশ মহিলা পরিষদ",
    description_en:
      "A long-established women's rights organization offering legal aid and support for violence and discrimination against women and girls.",
    description_bn:
      "নারী ও কন্যাশিশুদের বিরুদ্ধে সহিংসতা ও বৈষম্যের ক্ষেত্রে আইনি সহায়তা প্রদানকারী একটি দীর্ঘ প্রতিষ্ঠিত নারী অধিকার সংগঠন।",
    url: "https://mahilaparishad.org",
    availability_en: "See website for contact details",
    availability_bn: "যোগাযোগের বিস্তারিত জানতে ওয়েবসাইট দেখুন",
  },
];
