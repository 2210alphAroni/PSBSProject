import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-payments',
  imports: [ CommonModule ],
  templateUrl: './admin-payments.html',
  styleUrl: './admin-payments.css',
})
export class AdminPayments implements OnInit {
  payments: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPayments();
  }
  loadPayments(): void {
    this.http.get<any[]>('https://localhost:7272/api/Bookings')
      .subscribe({
        next: res => {
          console.log('Payments from Bookings:', res); // ✅ debug
          this.payments = res;
          this.loading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.error = 'Failed to load payments from bookings'; 
          this.loading = false;
        }
      });
  }
}
