import { ChangeDetectorRef, Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-photographer-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './photographer-dashboard.html',
  styleUrl: './photographer-dashboard.css',
})
export class PhotographerDashboard {

  sidebarOpen = false;

  // Photographer info
  photographerName: string = '';

  // Dashboard stats
  totalBookings: number = 0;
  pendingBookings: number = 0;
  totalEarnings: number = 0;
  averageRating: number = 0;

  // Lists
  TotalBookings: any[] = [];
  recentActivities: any[] = [];
  photographerId!: number;

  constructor(
    private http: HttpClient,
    public router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loadPhotographerInfo();
    this.loadDashboard();
  }

  /* ================= UI ================= */

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  /* ================= LOAD DATA ================= */

  loadDashboard() {
    this.loadStats();
    this.loadTotalBookings();
    this.loadRecentActivity();
  }

  loadPhotographerInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    this.photographerName = user?.fullName || 'Photographer';
    this.photographerId = user?.userId;

    console.log('Photographer ID:', this.photographerId);  // for debugging
  }


  loadStats() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const photographerId = user?.userId;

    if (!photographerId) {
      console.error('Photographer ID missing');
      return;
    }

    this.http
      .get<any>(`https://localhost:7272/api/PhotographerDashboard/dashboard-stats/${photographerId}`)
      .subscribe({
        next: res => {
          console.log('Dashboard response:', res); // Debug log

          this.totalBookings = res.TotalBookings;
          this.pendingBookings = res.PendingBookings;
          this.totalEarnings = res.TotalEarnings;

          this.cdr.detectChanges();
        },
        error: err => {
          console.error('API error:', err);
        }
      });
  }



  loadTotalBookings() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const photographerId = user?.userId;

    if (!photographerId) {
      console.error('Photographer ID missing');
      return;
    }

    this.http
      .get<any[]>(
        `https://localhost:7272/api/PhotographerDashboard/recent-bookings/${photographerId}`
      )
      .subscribe({
        next: res => {
          console.log('Recent Bookings:', res);
          this.TotalBookings = res;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Failed to load recent bookings', err);
        }
      });
  }


  loadRecentActivity() {
    if (!this.photographerId) {
      console.error('Photographer ID missing for activity');
      return;
    }

    this.http
      .get<any[]>(
        `https://localhost:7272/api/PhotographerDashboard/recent-activity/${this.photographerId}`
      )
      .subscribe({
        next: res => {
          console.log('Photographer Activities:', res);
          this.recentActivities = res;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Failed to load activities', err);
        }
      });
  }



}