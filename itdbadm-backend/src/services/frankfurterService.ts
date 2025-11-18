// services/frankfurterService.ts
import axios from "axios";

export class FrankfurterService {
  private static baseURL = "https://api.frankfurter.app/latest";
  private static rates: Record<string, number> = {
    USD: 0.0067,
    EUR: 0.0062,
    GBP: 0.0053,
    AUD: 0.0102,
    CAD: 0.0091,
    CHF: 0.0059,
    CNY: 0.048,
    PHP: 0.38,
    VND: 162,
    JPY: 1,
  };
  private static lastUpdated: number = Date.now();
  private static updateInterval = 1000 * 60 * 60 * 24; // 24 hours
  private static isInitialized = false;

  // Initialize the service and start the cron job
  static initialize(): void {
    if (this.isInitialized) return;

    this.isInitialized = true;

    // Fetch rates immediately on startup
    this.fetchLatestRates().catch((error) => {
      console.error("Initial Frankfurter API fetch failed:", error);
    });

    // Set up daily cron job
    setInterval(() => {
      this.fetchLatestRates().catch((error) => {
        console.error("Scheduled Frankfurter API fetch failed:", error);
      });
    }, this.updateInterval);

    console.log("FrankfurterService initialized with daily updates");
  }

  private static async fetchLatestRates(): Promise<void> {
    try {
      const response = await axios.get(`${this.baseURL}?from=JPY`);
      this.rates = { ...response.data.rates, JPY: 1 };
      this.lastUpdated = Date.now();

      console.log("FrankfurterService: Exchange rates updated successfully");
    } catch (error) {
      console.error(
        "FrankfurterService: API fetch failed, using cached rates:",
        error
      );
      // Keep using the existing rates if API fails
    }
  }

  // Synchronous conversion - no await needed!
  static convert(
    amountJPY: number,
    targetCurrency: string
  ): {
    amount: number;
  } {
    if (!this.isInitialized) {
      this.initialize();
    }

    const target = targetCurrency.toUpperCase();
    const rate = this.rates[target];

    if (!rate) {
      console.warn(
        `FrankfurterService: Currency ${target} not supported, returning original amount`
      );
      return {
        amount: this.roundToTwoDecimals(amountJPY),
      };
    }

    const convertedAmount = amountJPY * rate;

    return {
      amount: this.roundToTwoDecimals(convertedAmount),
    };
  }

  // Add this function to your FrankfurterService class
  static convertToYen(
    amount: number,
    fromCurrency: string
  ): {
    amount: number;
  } {
    if (!this.isInitialized) {
      this.initialize();
    }

    const from = fromCurrency.toUpperCase();

    // If already JPY, no conversion needed
    if (from === "JPY") {
      return {
        amount: this.roundToTwoDecimals(amount),
      };
    }

    const rate = this.rates[from];

    if (!rate) {
      console.warn(
        `FrankfurterService: Currency ${from} not supported, returning original amount`
      );
      return {
        amount: this.roundToTwoDecimals(amount),
      };
    }

    // Convert to JPY: amount / rate (since rates are from JPY perspective)
    const convertedAmount = amount / rate;

    return {
      amount: this.roundToTwoDecimals(convertedAmount),
    };
  }

  // Get last update timestamp
  static getLastUpdateTime(): number {
    return this.lastUpdated;
  }

  // Get all available currencies
  static getAvailableCurrencies(): string[] {
    return Object.keys(this.rates);
  }

  // Get current rates (read-only)
  static getCurrentRates(): Record<string, number> {
    return { ...this.rates };
  }

  private static roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }
}

// Auto-initialize when the module is imported
FrankfurterService.initialize();
