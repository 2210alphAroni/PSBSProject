import { ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard {

  sidebarOpen = false;

  // Dashboard data
  stats = {
    totalUsers: 0,
    photographers: 0,
    bookings: 0,
    revenue: 0
  };
  userCount: any[] = [];
  recentActivities: any[] = [];

  constructor(private httpRequest: HttpClient, private router: Router, private cdr: ChangeDetectorRef) {
    this.loadDashboard();
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  loadDashboard() {
    this.loadStats();
    this.loadRecentActivity();
  }

  loadStats() {
    this.httpRequest.get<any>('https://localhost:7272/api/Dashboard/dashboard')
      .subscribe(res => {
        this.userCount = res.user;
        this.cdr.detectChanges();
      });
  }

 loadRecentActivity() {
  this.httpRequest
    .get<any[]>('https://localhost:7272/api/Dashboard/recent-activity')
    .subscribe(res => {
      this.recentActivities = res; 
      console.log('Recent Activities:', res); //debug
    });
}


}

