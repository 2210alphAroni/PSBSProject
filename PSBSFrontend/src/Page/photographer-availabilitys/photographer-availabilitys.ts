import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-photographer-availabilitys',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './photographer-availabilitys.html',
  styleUrl: './photographer-availabilitys.css'
})
export class PhotographerAvailabilitys {

  photographerId!: number;

  eventDate: string = '';
  startTime: string = '';
  durationHours: number = 1;

  isAvailable: boolean | null = null;

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {
    this.loadPhotographerId();
  }

  // ✅ SAFE photographerId LOAD
  loadPhotographerId() {
    const userData = localStorage.getItem('user');

    if (!userData) {
      alert('User not logged in');
      return;
    }

    const user = JSON.parse(userData);

    // ✅ ALL POSSIBLE CASE HANDLED
    this.photographerId =
      user.id ??
      user.userId ??
      user.photographerId ??
      0;

    if (!this.photographerId) {
      alert('Photographer ID not found');
    }
  }

  // ✅ FINAL API CALL
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
        debugger;
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
