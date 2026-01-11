import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-photographer-earnings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photographer-earnings.html',
  styleUrl: './photographer-earnings.css'
})
export class PhotographerEarnings implements OnInit {

  earnings: any[] = [];
  photographerId: number | null = null;
  searchText: string = '';

  apiUrl = 'https://localhost:7272/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {

    const storedUser = localStorage.getItem('user');

    if (!storedUser) {
      console.error('No user found in localStorage');
      return;
    }

    const user = JSON.parse(storedUser);

    if (!user?.userId) {
      console.error('Invalid user object:', user);
      return;
    }

    this.photographerId = user.userId;

    console.log('Photographer ID:', this.photographerId);

    this.loadEarnings();
  }

  /* ================= LOAD EARNINGS ================= */
  loadEarnings() {

    if (!this.photographerId) {
      console.error('Photographer ID is missing');
      return;
    }

    const url = `${this.apiUrl}/Bookings/photographer-earnings/${this.photographerId}`;
    console.log('🌐 API URL:', url);

    this.http.get<any[]>(url).subscribe({
      next: res => {
        console.log('Earnings API Response:', res);
        this.earnings = res;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Earnings API Error:', err);
      }
    });
  }

  /* ================= SEARCH FILTER ================= */
  get filteredEarnings() {
    if (!this.searchText) return this.earnings;

    return this.earnings.filter(e =>
      e.PackageName?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  /* ================= GRAND TOTAL ================= */
  get grandTotal(): number {
    return this.filteredEarnings.reduce(
      (sum, e) => sum + (e.TotalEarnings || 0),
      0
    );
  }
}
