import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
})
export class AdminBookings implements OnInit {

  bookings: any[] = [];
  loading = true;
  error = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.http.get<any[]>('https://localhost:7272/api/Bookings')
      .subscribe({
        next: res => {
          console.log('Bookings:', res); // ✅ debug
          this.bookings = res;
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load bookings';
          this.loading = false;
        }
      });
  }
}
