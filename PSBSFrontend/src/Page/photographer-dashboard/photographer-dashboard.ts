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
  recentBookings: any[] = [];
  recentActivities: any[] = [];

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
    this.loadRecentBookings();
    this.loadRecentActivity();
  }

  loadPhotographerInfo() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.photographerName = user?.fullName || 'Photographer';
  }

  loadStats() {
    this.http
      .get<any>('https://localhost:7272/api/Photographer/dashboard-stats')
      .subscribe(res => {
        this.totalBookings = res.totalBookings;
        this.pendingBookings = res.pendingBookings;
        this.totalEarnings = res.totalEarnings;
        this.averageRating = res.averageRating;
        this.cdr.detectChanges();
      });
  }

  loadRecentBookings() {
    this.http
      .get<any[]>('https://localhost:7272/api/Photographer/recent-bookings')
      .subscribe(res => {
        this.recentBookings = res;
        this.cdr.detectChanges();
      });
  }

  loadRecentActivity() {
    this.http
      .get<any[]>('https://localhost:7272/api/Photographer/recent-activity')
      .subscribe(res => {
        this.recentActivities = res;
        console.log('Photographer Activities:', res);
        this.cdr.detectChanges();
      });
  }

}