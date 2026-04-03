/**
 * Utility for formatting currency in Naira (₦)
 */
export function formatCurrency(amount: number | string | undefined | null): string {
    if (amount === undefined || amount === null) return '₦0.00';
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(numericAmount).replace('NGN', '₦').trim();
}

/**
 * Strips HTML tags and replaces &nbsp; with spaces
 */
export function stripHtml(html: string): string {
    if (!html) return '';
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Replaces &nbsp; with regular spaces in HTML content
 */
export function cleanContent(html: string): string {
    if (!html) return '';
    return html
        .replace(/&nbsp;/g, ' ')
        .trim();
}
