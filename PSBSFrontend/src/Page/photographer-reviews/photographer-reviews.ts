import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-photographer-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './photographer-reviews.html',
  styleUrl: './photographer-reviews.css'
})
export class PhotographerReviews implements OnInit {

  photographerId!: number;
  reviews: any[] = [];
  averageRating: number = 0;

  private apiUrl =
    'https://localhost:7272/api/ReviewRating/photographer';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPhotographerId();
  }

  // 🔹 photographerId load from localStorage.user
  loadPhotographerId() {
    const userStr = localStorage.getItem('user');

    if (!userStr) {
      console.error('User not found in localStorage');
      return;
    }

    const user = JSON.parse(userStr);

    if (!user.userId) {
      console.error('userId not found in user object');
      return;
    }

    // ✅ userId = photographerId
    this.photographerId = user.userId;

    console.log('Photographer ID:', this.photographerId);

    this.loadReviews();
  }

  // 🔹 Load reviews by photographerId
  loadReviews() {
    this.http
      .get<any[]>(`${this.apiUrl}/${this.photographerId}`)
      .subscribe({
        next: (res) => {
          this.reviews = res || [];
          this.cdr.detectChanges();
          this.calculateAverage();
        },
        error: (err) => {
          console.error('Review load failed', err);
        }
      });
  }

  // 🔹 Calculate average rating
  calculateAverage() {
    if (this.reviews.length === 0) {
      this.averageRating = 0;
      return;
    }

    const total = this.reviews.reduce(
      (sum, r) => sum + Number(r.Rating || 0),
      0
      
    );
    this.cdr.detectChanges();

    this.averageRating = +(
      total / this.reviews.length
    ).toFixed(1);
    this.cdr.detectChanges();
  }
}
