import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-check-photographer-availability',
  imports: [CommonModule, FormsModule],
  templateUrl: './check-photographer-availability.html',
  styleUrl: './check-photographer-availability.css'
})
export class CheckPhotographerAvailability implements OnInit {

  photographerId!: number;
  eventDate: string = '';
  startTime: string = '';
  durationHours: number = 1;
  minDate: string = '';

  isAvailable: boolean | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    // ✅ SAME AS ReviewRating PAGE (QUERY PARAM)
    this.route.queryParams.subscribe(params => {

      const queryId = Number(params['photographerId']);

      if (queryId && !isNaN(queryId)) {
        this.photographerId = queryId;
        return;
      }

      // 🔁 fallback (old logic untouched)
      this.loadPhotographerId();
    });

    // ✅ FIX FOR MIN DATE
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];
  }

  // 🔁 OLD LOGIC (UNCHANGED)
  loadPhotographerId() {

    const userData = localStorage.getItem('user');

    if (!userData) {
      alert('User not logged in');
      return;
    }

    const user = JSON.parse(userData);

    this.photographerId =
      user.id ??
      user.userId ??
      user.photographerId ??
      0;

    if (!this.photographerId) {
      alert('Photographer ID not found');
    }
  }

  // ✅ API CALL (UNCHANGED)
  checkAvailability() {

    if (!this.photographerId) {
      alert('Invalid photographer');
      return;
    }

    if (!this.eventDate || !this.startTime || !this.durationHours) {
      alert('Please fill all fields');
      return;
    }

    const params = {
      photographerId: this.photographerId.toString(),
      eventDate: this.eventDate,
      startTime: this.startTime,
      durationHours: this.durationHours.toString()
    };

    this.http.get<any>(
      'https://localhost:7272/api/Bookings/check-availability-check',
      { params }
    ).subscribe({
      next: res => {
        this.isAvailable = res.isAvailable;
        this.cdr.detectChanges();
      },
      error: err => {
        console.error(err);
        alert('Availability check failed');
      }
    });
  }
}
