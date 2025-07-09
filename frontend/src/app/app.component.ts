import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from './components/nav/nav.component';
import { StatMonthlyComponent } from './components/stat-monthly/stat-monthly.component';
import { StatCircleComponent } from './components/stat-circle/stat-circle.component';
import { StatDailyComponent } from './components/stat-daily/stat-daily.component';
import { CalComponent } from './components/cal/cal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    NavComponent,
    StatMonthlyComponent,
    StatCircleComponent,
    StatDailyComponent,
    CalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nomoney';
}
