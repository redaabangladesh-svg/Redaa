export const WA_TEMPLATES = {
  ORDER_CONFIRM: (name: string, product: string, total: number) =>
    `আসসালামুয়ালাইকুম ${name} ভাই/আপা 😊\n\nআপনার *${product}* অর্ডারটি confirm হয়েছে ✅\nমোট: ৳${total}\n\nআমরা শীঘ্রই deliver করবো। ধন্যবাদ 🌸`,

  ORDER_SHIPPED: (name: string, courier: string, tracking: string) =>
    `${name} ভাই/আপা,\n\nআপনার পণ্য *${courier}*-এ পাঠানো হয়েছে 🚚\nTracking: *${tracking}*\n\nধন্যবাদ 🌸`,

  ORDER_DELIVERED: (name: string) =>
    `প্রিয় ${name}, আপনার পণ্য ডেলিভারি হয়েছে ✅ আমাদের সেবা কেমন লাগলো জানাবেন। ধন্যবাদ 🌸`,
};

export function getWhatsAppURL(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const withCountryCode = cleanPhone.startsWith('88') ? cleanPhone : `88${cleanPhone}`;
  return `https://wa.me/${withCountryCode}?text=${encodeURIComponent(message)}`;
}
