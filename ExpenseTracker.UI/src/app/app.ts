import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CalendarComponent } from './components/calendar/calendar';
import { StatisticsComponent } from './components/statistics/statistics';
import { FabBarComponent } from './components/fab-bar/fab-bar';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CalendarComponent, StatisticsComponent, FabBarComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'Charlie';
  viewedMonth = signal<Date>(new Date());

  onMonthChange(date: Date) {
    this.viewedMonth.set(date);
  }
}
