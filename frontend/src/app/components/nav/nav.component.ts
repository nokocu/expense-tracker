import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  
  changeLanguage(): void {
    // placeholder for future implementation
    console.log('language change requested');
  }

  changeCurrency(): void {
    // placeholder for future implementation
    console.log('currency change requested');
  }
}
