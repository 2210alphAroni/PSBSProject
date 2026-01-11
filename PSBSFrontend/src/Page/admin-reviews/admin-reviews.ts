import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
})
export class AdminReviews implements OnInit {

  photographers: any[] = [];
  reviewsMap: { [key: number]: any[] } = {};
  averageMap: { [key: number]: any } = {};   // ✅ ADDED
  searchText: string = '';

  apiUrl = 'https://localhost:7272/api';

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadPhotographers();
  }

  // ================= LOAD PHOTOGRAPHERS =================
  loadPhotographers() {
    this.http
      .get<any[]>(`${this.apiUrl}/UsersRegistration/available-photographers`)
      .subscribe({
        next: (res) => {
          this.photographers = res;

          this.photographers.forEach(p => {
            this.loadReviewsByPhotographer(p.Id);
            this.loadAverageRating(p.Id);   // ✅ ADDED
          });
        },
        error: (err) => console.error(err),
      });
  }

  // ================= LOAD REVIEWS =================
  loadReviewsByPhotographer(photographerId: number) {
    this.http
      .get<any[]>(`${this.apiUrl}/ReviewRating/photographer/${photographerId}`)
      .subscribe({
        next: (res) => {
          this.reviewsMap[photographerId] = res;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  // ================= LOAD AVERAGE RATING =================
  loadAverageRating(photographerId: number) {
    this.http
      .get<any>(`${this.apiUrl}/ReviewRating/average/${photographerId}`)
      .subscribe({
        next: (res) => {
          this.averageMap[photographerId] = res;
          this.cdr.detectChanges();
        },
        error: (err) => console.error(err),
      });
  }

  // ================= FILTERED PHOTOGRAPHERS =================
  get filteredPhotographers() {
    if (!this.searchText)
      return this.photographers;

    return this.photographers.filter(p =>
      p.FullName.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }


  // ================= STAR ARRAY =================
  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }
}
