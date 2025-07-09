import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar';
import { FormComponent } from './components/form/form';
import { CurrencySelectorComponent } from './components/currency/currency';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CalendarComponent, FormComponent, CurrencySelectorComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Expense Tracker';
}
