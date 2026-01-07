import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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

  photographer: any = null;

  rating: number = 5;
  reviewComment: string = '';

  averageRating: number = 0;
  totalReviews: number = 0;

  reviews: any[] = [];
  alreadyReviewed = false;

  isLoadingAvg = true;
  isLoadingReviews = true;

  // 🔐 UI SAFETY FLAGS
  showCommentError = false;
  isSubmitting = false;

  private api = 'https://localhost:7272/api/ReviewRating';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.userId = user?.id || user?.userId || 0;

    this.route.queryParams.subscribe(params => {
      this.photographerId = Number(params['photographerId']);

      if (!this.photographerId) return;

      this.loadPhotographer();
      this.loadReviews();
      this.loadAverageRating();
    });
  }

  loadPhotographer() {
    this.http
      .get<any>(`https://localhost:7272/api/UsersRegistration/${this.photographerId}`)
      .subscribe(res => this.photographer = res);
  }

  submitReview() {

    this.showCommentError = false;

    if (!this.userId) {
      alert('Please login to submit a review');
      return;
    }

    if (!this.reviewComment.trim()) {
      this.showCommentError = true;
      return;
    }

    if (this.rating < 1 || this.rating > 5) {
      alert('Please select a rating between 1 and 5');
      return;
    }

    this.isSubmitting = true;

    const data = {
      userId: this.userId,
      photographerId: this.photographerId,
      rating: this.rating,
      reviewComment: this.reviewComment
    };

    this.http.post(this.api, data).subscribe({
      next: () => {
        this.reviewComment = '';
        this.alreadyReviewed = true;
        this.loadReviews();
        this.loadAverageRating();
        this.isSubmitting = false;
        this.cdr.detectChanges();
        window.location.reload();
      },
      error: err => {
        console.error(err);
        alert(err.error?.message || 'Failed to submit review');
        this.isSubmitting = false;
      }
    });
  }

  loadReviews() {
    this.isLoadingReviews = true;
    this.http
      .get<any[]>(`${this.api}/photographer/${this.photographerId}`)
      .subscribe(res => {
        this.reviews = res;
        this.isLoadingReviews = false;
        this.cdr.detectChanges();
      });
  }

  loadAverageRating() {
    this.isLoadingAvg = true;
    this.http
      .get<any>(`${this.api}/average/${this.photographerId}`)
      .subscribe(res => {
        this.averageRating = Number(res.AverageRating) || 0;
        this.totalReviews = Number(res.TotalReviews) || 0;
        this.isLoadingAvg = false;
        this.cdr.detectChanges();
      });
  }

  setRating(value: number) {
    this.rating = value;
  }

  getStarArray() {
    return [1, 2, 3, 4, 5];
  }

  getRoundedRating(): number {
    return Math.round(this.averageRating || 0);
  }
}
