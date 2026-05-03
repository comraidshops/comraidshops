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
 * Replaces &nbsp; and other special spaces with regular spaces in HTML content
 */
export function cleanContent(html: string): string {
    if (!html) return '';
    return html
        .replace(/&nbsp;/g, ' ')
        .replace(/[\u00A0\u202F\u2007\u2008\u2009\u200A]/g, ' ')
        .trim();
}

/**
 * Maps backend payment status to customer-facing display text
 */
export function formatCustomerPaymentStatus(status: string): string {
    if (!status) return 'Unknown';
    const raw = status.toLowerCase();
    switch (raw) {
        case 'pending': return 'Awaiting Payment';
        case 'paid': return 'Payment Received (Processing)';
        case 'confirmed': return 'Order Confirmed';
        case 'failed': return 'Payment Failed';
        case 'refunded': return 'Refunded';
        default: return status;
    }
}

/**
 * Maps backend payment status to vendor-facing display text to prevent premature fulfillment
 */
export function formatVendorPaymentStatus(status: string): string {
    if (!status) return 'Unknown';
    const raw = status.toLowerCase();
    switch (raw) {
        case 'pending': return 'Awaiting Payment';
        case 'paid': return 'Payment Received – Do Not Fulfill Yet';
        case 'confirmed': return 'Ready to Fulfill';
        case 'failed': return 'Payment Failed';
        case 'refunded': return 'Refunded';
        default: return status;
    }
}
