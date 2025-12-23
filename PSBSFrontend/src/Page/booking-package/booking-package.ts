import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

/* ================= PACKAGE MODEL ================= */
export interface Package {
  id: number;
  name: string;
  description: string;
  duration: string;
  editedPhotos: string;
  rawFiles: boolean;
  price: number;
  category: string;
  addOns: string[];
  isActive: boolean;
}

/* ================= BOOKING MODEL ================= */
export interface Booking {
  packageId: number | null;
  category: string;
  description: string;
  duration: string;
  editedPhotos: string;
  rawFiles: boolean;
  eventDate: string;
  location: string;
  notes: string;
  price: number;
}

@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule, RouterModule],
  templateUrl: './booking-package.html',
  styleUrl: './booking-package.css',
})
export class BookingPackage implements OnInit {

  /* ================= STATE ================= */
  packages: Package[] = [];

  booking: Booking = {
    packageId: null,
    category: '',
    description: '',
    duration: '',
    editedPhotos: '',
    rawFiles: false,
    eventDate: '',
    location: '',
    notes: '',
    price: 0
  };

  isLoading = false;

  /* ================= API URLs ================= */
  private packagesApiUrl = 'https://localhost:7272/api/packages';
  private bookingApiUrl = 'https://localhost:7272/api/bookings'; // create later

  constructor(private http: HttpClient) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.loadPackages();
  }

  /* ================= LOAD PACKAGES ================= */
  loadPackages(): void {
    this.http.get<Package[]>(this.packagesApiUrl).subscribe({
      next: (res) => {
        this.packages = (res ?? [])
          .filter(p => p.isActive) // only active packages
          .map(p => ({
            ...p,
            addOns: p.addOns ?? []
          }));
      },
      error: (err) => {
        console.error('Failed to load packages', err);
      }
    });
  }

  /* ================= PACKAGE CHANGE ================= */
  onPackageChange(): void {
    const selected = this.packages.find(
      p => p.id === this.booking.packageId
    );

    if (!selected) return;

    // auto-fill booking fields from selected package
    this.booking.category = selected.category;
    this.booking.description = selected.description;
    this.booking.duration = selected.duration;
    this.booking.editedPhotos = selected.editedPhotos;
    this.booking.rawFiles = selected.rawFiles;
    this.booking.price = selected.price;
  }

  /* ================= SUBMIT BOOKING ================= */
  submitBooking(form: NgForm): void {
    if (form.invalid || !this.booking.packageId) return;

    this.isLoading = true;

    this.http.post(this.bookingApiUrl, this.booking).subscribe({
      next: () => {
        alert('Booking confirmed successfully!');
        form.resetForm();
        this.resetBooking();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Booking failed', err);
        this.isLoading = false;
      }
    });
  }

  /* ================= RESET ================= */
  private resetBooking(): void {
    this.booking = {
      packageId: null,
      category: '',
      description: '',
      duration: '',
      editedPhotos: '',
      rawFiles: false,
      eventDate: '',
      location: '',
      notes: '',
      price: 0
    };
  }
}
