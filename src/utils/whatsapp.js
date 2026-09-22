export function getWhatsAppUrl(phone, message = "Hello, I'm interested in your property.") {
  if (!phone) return null;
  // Remove any non-digit characters and ensure Kenyan format (254...)
  const cleanPhone = phone.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('254') ? cleanPhone : `254${cleanPhone.replace(/^0/, '')}`;
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

export function openWhatsApp(phone, message = "Hello, I'm interested in your property.") {
  const url = getWhatsAppUrl(phone, message);
  if (url) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
