import { ChangeDetectorRef, Component} from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

// for admin dashboard charts and stats
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css'
})
export class AdminDashboard{

  sidebarOpen = false;

  // for charts
  userBarChart: any;
  bookingLineChart: any;
  overviewPieChart: any;



  // Dashboard data
  stats = {
    totalUsers: 0,
    photographers: 0,
    bookings: 0,
    revenue: 0
  };
  userCount: any[] = [];
  recentActivities: any[] = [];
  packageCount: number = 0;
  bookingCount: number = 0;

  constructor(private httpRequest: HttpClient, public router: Router, private cdr: ChangeDetectorRef) {
    this.loadDashboard();
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
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
        // for bar charts 
        this.createUserBarChart();
        // for pie charts
        this.createOverviewPieChart();
        this.cdr.detectChanges();
      });
  }

  ngOnInit() {
    this.loadPackageCount();
    this.loadBookingCount();
  }

  loadPackageCount() {
    this.httpRequest.get<any[]>('https://localhost:7272/api/Packages')
      .subscribe(res => {
        this.packageCount = res.length;
        // for pie charts
        this.createOverviewPieChart();
        this.cdr.detectChanges();
      });
  }

  loadBookingCount() {
    this.httpRequest.get<any[]>('https://localhost:7272/api/Bookings')
      .subscribe(res => {
        this.bookingCount = res.length;
        // for line charts
        this.createBookingLineChart(res); 
        // for pie charts
        this.createOverviewPieChart();
        this.cdr.detectChanges();
      });
  }

  loadRecentActivity() {
    this.httpRequest
      .get<any[]>('https://localhost:7272/api/Dashboard/recent-activity')
      .subscribe(res => {
        this.recentActivities = res;
        console.log('Recent Activities:', res);  // Debugging line
        this.cdr.detectChanges();
      });
  }



  // chart functions
  createUserBarChart() {

  if (this.userBarChart) {
    this.userBarChart.destroy();
    this.cdr.detectChanges();
  }

  const labels = this.userCount.map(u => u.RegisterAS);
  const data = this.userCount.map(u => u.personCount);

  this.userBarChart = new Chart('userBarChart', {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Users',
        data: data,
        backgroundColor: '#0d6efd'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

createBookingLineChart(bookings: any[]) {

  if (this.bookingLineChart) {
    this.bookingLineChart.destroy();
    this.cdr.detectChanges();
  }

  const grouped: any = {};

  bookings.forEach(b => {
    const rawDate = b.createdAt || b.bookingDate;
    const date = new Date(rawDate).toLocaleDateString();
    grouped[date] = (grouped[date] || 0) + 1;
  });

  const labels = Object.keys(grouped);

  let runningTotal = 0;
  const data = Object.values(grouped).map((count: any) => {
    runningTotal += count;
    return runningTotal;
  });

  this.bookingLineChart = new Chart('bookingLineChart', {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Bookings',
        data: data,
        borderColor: '#198754',
        tension: 0.3,
        fill: false
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { precision: 0 }
        }
      }
    }
  });
}


createOverviewPieChart() {

  if (this.overviewPieChart) {
    this.overviewPieChart.destroy();
    this.cdr.detectChanges();
  }

  let admin = 0;
  let client = 0;
  let photographer = 0;

  this.userCount.forEach(u => {
    if (u.RegisterAS === 'Admin') admin = u.personCount;
    if (u.RegisterAS === 'Client') client = u.personCount;
    if (u.RegisterAS === 'Photographer') photographer = u.personCount;
  });

  this.overviewPieChart = new Chart('overviewPieChart', {
    type: 'pie',
    data: {
      labels: [
        'Admins',
        'Clients',
        'Photographers',
        'Packages',
        'Bookings'
      ],
      datasets: [{
        data: [
          admin,
          client,
          photographer,
          this.packageCount,
          this.bookingCount
        ],
        backgroundColor: [
          '#0d6efd',
          '#20c997',
          '#ffc107',
          '#6f42c1',
          '#dc3545'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      }
    }
  });
}


}

