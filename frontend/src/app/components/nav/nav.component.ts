import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CurrencyService } from '../../services/currency.service';
import { TranslationService, Language } from '../../services/translation.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  currentCurrency: string = 'pln';
  currencyInputValue: string = '';
  currentLanguage: Language = 'en';
  private subscription = new Subscription();

  constructor(
    private currencyService: CurrencyService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.currencyService.currency$.subscribe(currency => {
        this.currentCurrency = currency;
      })
    );

    this.subscription.add(
      this.translationService.language$.subscribe((language: Language) => {
        this.currentLanguage = language;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
  
  changeLanguage(): void {
    this.translationService.toggleLanguage();
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }

  onCurrencyFocus(): void {
    // Clear the input value when focused so user can type new currency
    this.currencyInputValue = '';
  }

  onCurrencyInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.currencyInputValue = target.value;
  }

  onCurrencyBlur(): void {
    if (this.currencyInputValue.trim()) {
      this.currencyService.setCurrency(this.currencyInputValue.trim());
    }
    // Clear the input value on blur to show placeholder again
    this.currencyInputValue = '';
  }

  onCurrencyKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      if (this.currencyInputValue.trim()) {
        this.currencyService.setCurrency(this.currencyInputValue.trim());
      }
      // Clear the input and remove focus
      this.currencyInputValue = '';
      (event.target as HTMLInputElement).blur();
    }
  }

  changeTheme(): void {
    // placeholder
  }
}
