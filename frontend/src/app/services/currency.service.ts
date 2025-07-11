import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly CURRENCY_STORAGE_KEY = 'selectedCurrency';
  private currencySubject = new BehaviorSubject<string>(this.getStoredCurrency());
  
  currency$ = this.currencySubject.asObservable();

  constructor() {}

  private getStoredCurrency(): string {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem(this.CURRENCY_STORAGE_KEY) || 'pln';
    }
    return 'pln';
  }

  setCurrency(currency: string): void {
    const normalizedCurrency = currency.toLowerCase();
    this.currencySubject.next(normalizedCurrency);
    
    // persist to localStorage
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.CURRENCY_STORAGE_KEY, normalizedCurrency);
    }
  }

  getCurrentCurrency(): string {
    return this.currencySubject.value;
  }
}
