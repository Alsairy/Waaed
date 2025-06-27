export const formatDate = (date: Date, language: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return date.toLocaleDateString(locale, options);
};

export const formatTime = (date: Date, language: string): string => {
  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  return date.toLocaleTimeString(locale, options);
};

export const formatCurrency = (amount: number, language: string): string => {
  const locale = language === 'ar' ? 'ar-SA' : 'en-US';
  const currency = language === 'ar' ? 'SAR' : 'USD';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(amount);
};
