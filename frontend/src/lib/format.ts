/**
 * Utility for formatting currency in Naira (₦)
 */
export function formatCurrency(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (isNaN(numericAmount)) return '₦0.00';
    
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2,
    }).format(numericAmount).replace('NGN', '₦');
}
