import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-package.html',
  styleUrl: './booking-package.css',
})
export class BookingPackage implements OnInit {

  userId = 0;           // login system থেকে আসবে
  photographerId = 0;   // portfolio থেকে আসবে
  packageId!: number;

  booking = {
    EventCategory: '',
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
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.packageId = Number(params['packageId']);

      if (this.packageId && !isNaN(this.packageId)) {
        this.loadPackage(this.packageId);
      }
    });
  }

  loadPackage(id: number) {
    this.http
      .get<any>(`https://localhost:7272/api/Packages/${id}`)
      .subscribe(res => {
        console.log('Package Data:', res);  // Debugging line
        this.booking.PackageName = res.packageName;
        this.booking.CoverageDurationHours = res.coverageDurationHours;
        this.booking.EditedPhotos = res.maxEditedPhotos;
        this.booking.RawFilesAvailable = res.rawFilesAvailable;
        this.booking.Price = res.basePrice;

        this.photographerId = res.photographerId;
        this.cdr.detectChanges();
      });
  }

  submitBooking() {
  const payload = {
    UserId: this.userId,
    PhotographerId: this.photographerId,
    PackageId: this.packageId,

    EventCategory: this.booking.EventCategory,
    EventDate: new Date(this.booking.EventDate),
    EventLocation: this.booking.EventLocation,
    Notes: this.booking.Notes,

    PackageName: this.booking.PackageName,
    CoverageDurationHours: this.booking.CoverageDurationHours,
    EditedPhotos: this.booking.EditedPhotos,
    RawFilesAvailable: this.booking.RawFilesAvailable,
    Price: this.booking.Price
  };

  this.http
    .post('https://localhost:7272/api/Bookings', payload)
    .subscribe(() => {
      alert('Booking Confirmed Successfully');
      this.cdr.detectChanges();
    });
}

}
