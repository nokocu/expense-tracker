import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CurrencyService, Currency } from '../../services/currency';

@Component({
  selector: 'app-currency',
  imports: [CommonModule, FormsModule],
  templateUrl: './currency.html',
  styleUrl: './currency.scss'
})
export class CurrencySelectorComponent {
  constructor(public currencyService: CurrencyService) {}

  onCurrencyChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    const selectedCurrency = this.currencyService.currencies.find(
      currency => currency.code === select.value
    );
    if (selectedCurrency) {
      this.currencyService.setCurrency(selectedCurrency);
    }
  }

  onCustomSymbolChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currencyService.setCustomSymbol(input.value);
  }
}
