// utils/currencyFormatter.ts

// Currency configuration
interface CurrencyConfig {
  symbol: string;
  locale: string;
  options: Intl.NumberFormatOptions;
}

const CURRENCY_CONFIG: Record<string, CurrencyConfig> = {
  JPY: {
    symbol: "¥",
    locale: "ja-JP",
    options: { style: "currency", currency: "JPY", maximumFractionDigits: 0 },
  },
  USD: {
    symbol: "$",
    locale: "en-US",
    options: {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  PHP: {
    symbol: "₱",
    locale: "en-PH",
    options: {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
  TRY: {
    symbol: "₺",
    locale: "tr-TR",
    options: {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  },
};

export const formatPrice = (
  price: string | number,
  returnType: "symbol" | "code" = "symbol"
): string => {
  try {
    // Get selected currency from localStorage, default to JPY
    const selectedCurrency = localStorage.getItem("selectedCurrency") || "JPY";

    // Convert to number
    const numericPrice = typeof price === "string" ? parseFloat(price) : price;

    if (isNaN(numericPrice)) {
      return typeof price === "string" ? price : "Invalid price";
    }

    // Get currency config
    const currencyConfig =
      CURRENCY_CONFIG[selectedCurrency] || CURRENCY_CONFIG.JPY;

    // Format the price
    const formatter = new Intl.NumberFormat(
      currencyConfig.locale,
      currencyConfig.options
    );
    const formattedPrice = formatter.format(numericPrice);

    // Return either with symbol (default) or with currency code
    if (returnType === "code") {
      // Remove the symbol and add currency code
      const priceWithoutSymbol = formattedPrice
        .replace(currencyConfig.symbol, "")
        .trim();
      return `${priceWithoutSymbol} ${selectedCurrency}`;
    }

    return formattedPrice;
  } catch (error) {
    console.error("Error formatting price:", error);
    return typeof price === "string" ? price : "Invalid price";
  }
};

// Helper function to get current currency
export const getCurrentCurrency = (): string => {
  return localStorage.getItem("selectedCurrency") || "JPY";
};

// Helper function to get currency symbol or code
export const getCurrencyDisplay = (
  displayType: "symbol" | "code" = "symbol"
): string => {
  const currency = getCurrentCurrency();
  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.JPY;

  return displayType === "code" ? currency : config.symbol;
};

// Export currency configurations
export { CURRENCY_CONFIG };
