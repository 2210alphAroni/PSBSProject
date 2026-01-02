import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-package.html',
  styleUrl: './booking-package.css',
})
export class BookingPackage implements OnInit {

  userId = 0;           // login system থেকে আসবে
  photographerId = 0;   // package অথবা dropdown থেকে আসবে
  packageId!: number;

  // ✅ photographers list for dropdown
  photographers: any[] = [];
  bookingSuccess: boolean = false;

  booking = {
    EventDate: '',
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
  ) { }

  ngOnInit(): void {

    // ✅ Load photographers for dropdown
    this.loadPhotographers();

    this.route.queryParams.subscribe(params => {
      this.packageId = Number(params['packageId']);

      if (this.packageId && !isNaN(this.packageId)) {
        this.loadPackage(this.packageId);
      }
    });
  }

  // ✅ Photographer dropdown data
  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: (res) => {
        this.photographers = res;

        // ✅ AUTO select first photographer if not set
        if (!this.photographerId && this.photographers.length > 0) {
          this.photographerId = this.photographers[0].id;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load photographers', err);
      }
    });
  }
  // ✅ Load package details

  loadPackage(id: number) {
    this.http
      .get<any>(`https://localhost:7272/api/Packages/${id}`)
      .subscribe(res => {
        console.log('Package Data:', res);

        this.booking.PackageName = res.packageName;
        this.booking.CoverageDurationHours = res.coverageDurationHours;
        this.booking.EditedPhotos = res.maxEditedPhotos;
        this.booking.RawFilesAvailable = res.rawFilesAvailable;
        this.booking.Price = res.basePrice;

        // ✅ default photographer from package
        this.photographerId = res.photographerId;

        this.cdr.detectChanges();
      });
  }

  submitBooking() {

    // Photographer validation
  if (this.photographerId === 0) {
    alert('Please select a photographer');
    return;
  }

    // ✅ get logged in user
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.userId = userData.userId;
    }

    const payload = {
      UserId: this.userId,
      PhotographerId: this.photographerId,
      PackageId: this.packageId,

      EventDate: new Date(this.booking.EventDate),
      EventLocation: this.booking.EventLocation,
      Notes: this.booking.Notes,

      PackageName: this.booking.PackageName,
      CoverageDurationHours: this.booking.CoverageDurationHours,
      EditedPhotos: this.booking.EditedPhotos,
      RawFilesAvailable: this.booking.RawFilesAvailable,
      Price: this.booking.Price
    };


    console.log('Booking Payload:', payload);

    this.http
      .post('https://localhost:7272/api/Bookings', payload)
      .subscribe(() => {
        this.bookingSuccess = true;
        alert('Booking Confirmed Successfully');
        this.cdr.detectChanges();
        // this.router.navigate(['/home']);
      });
      error: (err: HttpErrorResponse) => {
        console.error('Booking failed', err);
        alert('Booking Failed. Please try again.');
      }
  }
}
