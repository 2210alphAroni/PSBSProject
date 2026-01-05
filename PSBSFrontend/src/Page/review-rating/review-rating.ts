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

  isLoadingAvg = true;   // 🔥 added for UX
  isLoadingReviews = true;

  private api = 'https://localhost:7272/api/ReviewRating';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.route.queryParams.subscribe(params => {
      this.photographerId = Number(params['photographerId']);

      if (!this.photographerId) return;

      this.loadPhotographer();
      this.loadReviews();
      this.loadAverageRating();
    });

    this.userId = Number(localStorage.getItem('userId'));
  }

  // ================= PHOTOGRAPHER INFO =================
  loadPhotographer() {
    this.http
      .get<any>(`https://localhost:7272/api/UsersRegistration/${this.photographerId}`)
      .subscribe({
        next: res => this.photographer = res,
        error: err => console.error(err),
        complete: () => this.cdr.detectChanges()
      });
  }

  // ================= ADD REVIEW =================
  submitReview() {
    const data = {
      userId: this.userId,
      photographerId: this.photographerId,
      bookingId: 0,
      rating: this.rating,
      reviewComment: this.reviewComment
    };

    this.http.post(this.api, data).subscribe({
      next: () => {
        this.reviewComment = '';
        this.alreadyReviewed = true;
        this.loadReviews();
        this.loadAverageRating();
        this.cdr.detectChanges();
      },
      error: err => alert(err.error)
    });
  }

  // ================= LOAD REVIEWS =================
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

  // ================= AVERAGE RATING =================
  loadAverageRating() {
    this.isLoadingAvg = true;
    this.http
      .get<any>(`${this.api}/average/${this.photographerId}`)
      .subscribe({
        next: res => {
          this.averageRating = Number(res?.averageRating) || 0;
          this.totalReviews = Number(res?.totalReviews) || 0;
          this.isLoadingAvg = false;
        },
        error: () => {
          this.averageRating = 0;
          this.totalReviews = 0;
          this.isLoadingAvg = false;
        }
      });
  }

  // ================= STAR CLICK =================
  setRating(value: number) {
    this.rating = value;
  }

  // ⭐ helper for average stars
  getStarArray() {
    return [1,2,3,4,5];
  }

  // ⭐ helper method
getRoundedRating(): number {
  return Math.round(this.averageRating || 0);
}

}
