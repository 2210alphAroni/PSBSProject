import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';

@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-package.html',
  styleUrl: './booking-package.css',
})
export class BookingPackage implements OnInit {

  userId = 0;
  photographerId = 0;
  packageId!: number;

  photographers: any[] = [];
  bookingSuccess = false;

  isPhotographerAvailable = true;
  availabilityMessage = '';
  checkingAvailability = false;

  booking = {
    EventDate: '',
    EventStartTime: '',
    EventLocation: '',
    Notes: '',
    PackageName: '',
    CoverageDurationHours: 0,
    EditedPhotos: 0,
    RawFilesAvailable: false,
    Price: 0
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private userService: UsersRegistrationService
  ) {}

  ngOnInit(): void {
    this.loadPhotographers();

    this.route.queryParams.subscribe(params => {
      this.packageId = Number(params['packageId']);
      if (this.packageId && !isNaN(this.packageId)) {
        this.loadPackage(this.packageId);
      }
    });
  }

  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: res => {
        this.photographers = res;
        this.cdr.detectChanges();
      }
    });
  }

  loadPackage(id: number) {
    this.http.get<any>(`https://localhost:7272/api/Packages/${id}`)
      .subscribe(res => {
        this.booking.PackageName = res.packageName;
        this.booking.CoverageDurationHours = res.coverageDurationHours;
        this.booking.EditedPhotos = res.maxEditedPhotos;
        this.booking.RawFilesAvailable = res.rawFilesAvailable;
        this.booking.Price = res.basePrice;
        this.photographerId = res.photographerId;
        this.cdr.detectChanges();
      });
  }

  // 🔥 TIME-BASED AVAILABILITY CHECK
  checkAvailability() {

    if (
      !this.photographerId ||
      !this.booking.EventDate ||
      !this.booking.EventStartTime
    ) {
      this.isPhotographerAvailable = true;
      this.availabilityMessage = '';
      return;
    }

    this.checkingAvailability = true;

    this.http.get<any>(
      'https://localhost:7272/api/Bookings/check-availability',
      {
        params: {
          photographerId: this.photographerId,
          eventDate: this.booking.EventDate,
          startTime: this.booking.EventStartTime,
          durationHours: this.booking.CoverageDurationHours
        }
      }
    ).subscribe({
      next: res => {
        this.isPhotographerAvailable = res.isAvailable;
        this.availabilityMessage = res.isAvailable
          ? ''
          : 'Photographer is already booked for this time slot';
        this.checkingAvailability = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.isPhotographerAvailable = false;
        this.availabilityMessage = 'Unable to check availability';
        this.checkingAvailability = false;
      }
    });
  }

  submitBooking() {

    if (!this.isPhotographerAvailable) {
      alert('Photographer is already booked for this time slot');
      return;
    }

    if (this.photographerId === 0) {
      alert('Please select a photographer');
      return;
    }

    const user = localStorage.getItem('user');
    if (user) {
      this.userId = JSON.parse(user).userId;
    }

    const payload = {
      UserId: this.userId,
      PhotographerId: this.photographerId,
      PackageId: this.packageId,

      EventDate: new Date(this.booking.EventDate),
      EventStartTime: this.booking.EventStartTime,

      EventLocation: this.booking.EventLocation,
      Notes: this.booking.Notes,

      PackageName: this.booking.PackageName,
      CoverageDurationHours: this.booking.CoverageDurationHours,
      EditedPhotos: this.booking.EditedPhotos,
      RawFilesAvailable: this.booking.RawFilesAvailable,
      Price: this.booking.Price
    };

    this.http.post('https://localhost:7272/api/Bookings', payload)
      .subscribe({
        next: () => {
          this.bookingSuccess = true;
          alert('Booking Confirmed Successfully');
          this.cdr.detectChanges();
          window.location.reload();
        },
        error: (err: HttpErrorResponse) => {
          if (err.status === 409) {
            alert('Photographer is already booked for this time slot');
          } else {
            alert('Booking Failed. Please try again.');
          }
        }
      });
  }
}
