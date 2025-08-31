export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount);
};

export const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

export const formatPercentage = (value: number): string => {
    return `${value.toFixed(2)}%`;
};

export const formatKpiValue = (value: number): string => {
    return value.toLocaleString();
};

export const formatVendorScore = (score: number): string => {
    return score >= 75 ? 'Good' : score >= 50 ? 'Average' : 'Poor';
};