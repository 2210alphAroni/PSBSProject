import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-review-rating',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './review-rating.html',
  styleUrl: './review-rating.css',
})
export class ReviewRating implements OnInit {

  photographerId!: number;
  userId!: number;

  rating: number = 5;
  reviewComment: string = '';

  averageRating: number = 0;
  totalReviews: number = 0;

  reviews: any[] = [];
  alreadyReviewed = false;

  private api = 'https://localhost:5001/api/ReviewRating';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {

    // 🔥 AUTO photographer from card click
    this.photographerId = Number(
      this.route.snapshot.paramMap.get('photographerId')
    );

    this.userId = Number(localStorage.getItem('userId'));

    this.loadReviews();
    this.loadAverageRating();
  }

  // ================= ADD REVIEW =================
  submitReview() {
    const data = {
      userId: this.userId,
      photographerId: this.photographerId,
      bookingId: 0, // later booking flow এ connect করবে
      rating: this.rating,
      reviewComment: this.reviewComment
    };

    this.http.post(this.api, data).subscribe({
      next: () => {
        alert('Review submitted successfully');
        this.reviewComment = '';
        this.loadReviews();
        this.loadAverageRating();
      },
      error: err => alert(err.error)
    });
  }

  // ================= LOAD REVIEWS =================
  loadReviews() {
    this.http
      .get<any[]>(`${this.api}/photographer/${this.photographerId}`)
      .subscribe(res => this.reviews = res);
  }

  // ================= AVERAGE RATING =================
  loadAverageRating() {
    this.http
      .get<any>(`${this.api}/average/${this.photographerId}`)
      .subscribe(res => {
        this.averageRating = res.averageRating;
        this.totalReviews = res.totalReviews;
      });
  }

  // ================= STAR CLICK =================
  setRating(value: number) {
    this.rating = value;
  }
}
