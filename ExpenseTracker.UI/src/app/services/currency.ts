import { Injectable, signal, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly STORAGE_KEY = 'expense-tracker-currency';

  // available currencies
  currencies: Currency[] = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'PLN', symbol: 'zł', name: 'Polish Złoty' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CUSTOM', symbol: '¤', name: 'Custom Currency' }
  ];

  // current selection as signal
  currentCurrency = signal<Currency>(this.currencies[2]);
  customSymbol = signal<string>('¤');

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    this.loadFromStorage();
  }

  // set currency
  setCurrency(currency: Currency) {
    this.currentCurrency.set(currency);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        currency: currency,
        customSymbol: this.customSymbol()
      }));
    }
  }

  // set custom symbol
  setCustomSymbol(symbol: string) {
    this.customSymbol.set(symbol);
    // If currently using custom currency, update storage
    if (this.currentCurrency().code === 'CUSTOM' && isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
        currency: this.currentCurrency(),
        customSymbol: symbol
      }));
    }
  }

  // get current symbol
  getCurrentSymbol(): string {
    const current = this.currentCurrency();
    return current.code === 'CUSTOM' ? this.customSymbol() : current.symbol;
  }

  // format amount with current currency
  formatAmount(amount: number): string {
    const symbol = this.getCurrentSymbol();
    return `${amount.toFixed(2)} ${symbol}`;
  }

  // load preferences from localStorage
  private loadFromStorage() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const currency = this.currencies.find(c => c.code === data.currency?.code);
        if (currency) {
          this.currentCurrency.set(currency);
        }
        if (data.customSymbol) {
          this.customSymbol.set(data.customSymbol);
        }
      } catch (e) {
        console.warn('Failed to parse saved currency settings');
      }
    }
  }
}
