import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  photographers: any[] = [];
  Math = Math;

  // 🔹 rating API base
  private ratingApi = 'https://localhost:7272/api/ReviewRating';

  constructor(
    private userService: UsersRegistrationService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loadPhotographers();
  }

  // Load photographers
  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: (res) => {
        this.photographers = res;

        // EACH photographer → rating load
        this.photographers.forEach(p => {
          this.loadRatingForPhotographer(p);
        });

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load photographers', err);
      }
    });
  }

  // ✅ NEW: load avg rating + total reviews
  loadRatingForPhotographer(p: any) {
    this.http
      .get<any>(`${this.ratingApi}/average/${p.Id}`)
      .subscribe({
        next: res => {
          p.AverageRating = Number(res.AverageRating) || 0;
          p.TotalReviews = Number(res.TotalReviews) || 0;
          this.cdr.detectChanges();
        },
        error: () => {
          p.AverageRating = 0;
          p.TotalReviews = 0;
        }
      });
  }

  // Booking navigation
  book(id: number): void {
    this.router.navigate(['/booking', id]);
  }

  // helper
  getRoundedRating(rating: number): number {
    return Math.round(rating || 0);
  }
}
