/**
 * Formate un montant avec sa devise.
 */
export function formatPrice(price: number, currency: string): string {
  // Format différent selon la devise
  switch (currency) {
    case 'GNF':
      return `${price.toLocaleString('fr-FR')} ${currency}`;
    case 'XOF':
      return `${price.toLocaleString('fr-FR')} ${currency}`;
    case 'USD':
      return `${price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}`;
    default:
      return `${price.toLocaleString()} ${currency}`;
  }
}

/**
 * Formate une date ISO en format lisible.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return '';
  
  try {
    const date = new Date(isoDate);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
    return isoDate;
  }
}

/**
 * Tronque un texte s'il dépasse une certaine longueur.
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
} 