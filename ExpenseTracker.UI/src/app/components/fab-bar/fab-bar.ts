import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CurrencySelectorComponent } from '../currency/currency';
import { FormComponent } from '../form/form';
import { gsap } from 'gsap';
import { CurrencyService } from '../../services/currency';

@Component({
  selector: 'app-fab-bar',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, CurrencySelectorComponent, FormComponent],
  templateUrl: './fab-bar.html',
  styleUrl: './fab-bar.scss'
})
export class FabBarComponent {
  showForm = signal(false);
  showCurrency = signal(false);

  constructor(public currencyService: CurrencyService) {}


  toggleForm() {
    if (this.showForm()) {
      this.closeForm();
    } else {
      this.showForm.set(true);
      setTimeout(() => {
        gsap.to('.fab-form-panel', { scale: 1, opacity: 1, duration: 0.5, ease: 'power2.out' });
      }, 10);
    }
  }

  closeForm() {
    gsap.to('.fab-form-panel', { scale: 0.8, opacity: 0, duration: 0.3, ease: 'power2.in', onComplete: () => this.showForm.set(false) });
  }

  toggleCurrency() {
    this.showCurrency.set(!this.showCurrency());
    setTimeout(() => {
      gsap.to('.fab-currency-panel', { y: this.showCurrency() ? 0 : 40, opacity: this.showCurrency() ? 1 : 0, duration: 0.4, ease: 'power2.out' });
    }, 10);
  }
}
