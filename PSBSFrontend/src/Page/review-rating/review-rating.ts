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

  photographer: any = null;   // photographer full info

  rating: number = 5;
  reviewComment: string = '';

  averageRating: number = 0;
  totalReviews: number = 0;

  reviews: any[] = [];
  alreadyReviewed = false;

  private api = 'https://localhost:7272/api/ReviewRating';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    // photographerId from query params
    this.route.queryParams.subscribe(params => {
      this.photographerId = Number(params['photographerId']);

      if (!this.photographerId) {
        console.error('Photographer ID missing');
        return;
      }

      this.loadPhotographer();     // 🔥 NEW
      this.loadReviews();
      this.loadAverageRating();
    });

    //  user id (unchanged)
    this.userId = Number(localStorage.getItem('userId'));
  }

  // ================= PHOTOGRAPHER INFO =================
  loadPhotographer() {
    this.http
      .get<any>(`https://localhost:7272/api/UsersRegistration/${this.photographerId}`)
      .subscribe({
        next: res => this.photographer = res,
        error: err => console.error('Failed to load photographer info', err),
        complete: () => this.cdr.detectChanges()
      });
  }

  // ================= ADD REVIEW =================
  submitReview() {
    const data = {
      userId: this.userId,
      photographerId: this.photographerId,
      bookingId: 0, // later booking flow
      rating: this.rating,
      reviewComment: this.reviewComment
    };

    this.http.post(this.api, data).subscribe({
      next: () => {
        alert('Review submitted successfully');
        this.reviewComment = '';
        this.loadReviews();
        this.loadAverageRating();
        this.alreadyReviewed = true;
        this.cdr.detectChanges();
      },
      error: err => alert(err.error)
    });
  }

  // ================= LOAD REVIEWS =================
  loadReviews() {
    this.http
      .get<any[]>(`${this.api}/photographer/${this.photographerId}`)
      .subscribe(res => this.reviews = res);
      this.cdr.detectChanges();
  }

  // ================= AVERAGE RATING =================
  loadAverageRating() {
    this.http
      .get<any>(`${this.api}/average/${this.photographerId}`)
      .subscribe(res => {
        this.averageRating = res.averageRating;
        this.totalReviews = res.totalReviews;
        this.cdr.detectChanges();
      });
  }

  // ================= STAR CLICK =================
  setRating(value: number) {
    this.rating = value;
  }
}
