export interface BlogPost {
  slug: string;
  title_en: string;
  title_bn: string;
  excerpt_en: string;
  excerpt_bn: string;
  content_en: string;
  content_bn: string;
  date: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'flowers-home-decoration-tips',
    title_en: 'How to Decorate Your Home with Flowers',
    title_bn: 'কীভাবে ঘর সাজাবেন ফুল দিয়ে',
    excerpt_en: 'Simple, budget-friendly ways to bring a fresh, natural look to every room using flower tubs and hanging plants.',
    excerpt_bn: 'ফুলের টব ও ঝুলন্ত গাছ দিয়ে প্রতিটি ঘরে সহজে প্রাকৃতিক ছোঁয়া আনার কিছু কার্যকর উপায়।',
    content_en: `Flowers instantly lift the mood of a room. Start with a statement piece near the entrance — a large ceramic tub with a seasonal plant works well. In the living room, pair a hanging bird's nest planter with a wall stand to create height and texture. Keep it simple: 2-3 well-placed pieces beat cluttering every corner. Choose pots that match your wall color for a cohesive look, and rotate flowers seasonally to keep the space feeling fresh.`,
    content_bn: `ফুল একটি ঘরের পরিবেশ মুহূর্তেই বদলে দিতে পারে। প্রবেশপথের কাছে একটি বড় সিরামিক টবে সিজনাল গাছ রাখুন। বসার ঘরে ঝুলন্ত বার্ড নেস্ট প্ল্যান্টারের সাথে একটি ওয়াল স্ট্যান্ড ব্যবহার করলে উচ্চতা ও টেক্সচার দুটোই যোগ হয়। বেশি জিনিস না রেখে ২-৩টি সঠিক জায়গায় রাখা পণ্যই যথেষ্ট। দেয়ালের রঙের সাথে মিলিয়ে টব বেছে নিন এবং সিজন অনুযায়ী ফুল পরিবর্তন করুন যাতে ঘর সবসময় সতেজ লাগে।`,
    date: '2026-05-12',
  },
  {
    slug: 'wedding-room-decoration-tips',
    title_en: '10 Tips for Decorating a Wedding Room',
    title_bn: 'বিয়ের ঘর সাজানোর ১০টি টিপস',
    excerpt_en: 'From lighting to floral arrangements — practical ideas to make the wedding room feel warm and festive.',
    excerpt_bn: 'আলোকসজ্জা থেকে ফুলের সাজ পর্যন্ত — বিয়ের ঘরকে উষ্ণ ও উৎসবমুখর করে তোলার কিছু ব্যবহারিক আইডিয়া।',
    content_en: `1. Start with a focal wall behind the seating area. 2. Use warm, soft lighting instead of harsh white lights. 3. Layer flower tubs at different heights along the walkway. 4. Keep a consistent color palette — 2 colors max. 5. Add a floral arch at the entrance. 6. Use hanging planters to soften bare corners. 7. Place small flower arrangements on every table. 8. Don't overcrowd the walkway — leave room to move. 9. Match the reception and stage decor. 10. Finish with a few premium centerpieces near the main stage for photos.`,
    content_bn: `১. বসার জায়গার পেছনের দেয়ালকে ফোকাল পয়েন্ট বানান। ২. কড়া সাদা আলোর বদলে উষ্ণ আলো ব্যবহার করুন। ৩. হাঁটার পথে বিভিন্ন উচ্চতায় ফুলের টব সাজান। ৪. সর্বোচ্চ ২টি রঙের মধ্যে থিম রাখুন। ৫. প্রবেশপথে একটি ফুলের আর্চ যোগ করুন। ৬. খালি কোণ ঢাকতে ঝুলন্ত প্ল্যান্টার ব্যবহার করুন। ৭. প্রতিটি টেবিলে ছোট ফুলের তোড়া রাখুন। ৮. হাঁটার পথ বেশি জিনিসে ভরে ফেলবেন না। ৯. রিসেপশন ও স্টেজের সাজ মিলিয়ে রাখুন। ১০. মূল স্টেজের কাছে ছবির জন্য কয়েকটি প্রিমিয়াম সেন্টারপিস রাখুন।`,
    date: '2026-04-03',
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
