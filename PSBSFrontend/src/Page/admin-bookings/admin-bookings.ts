import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-bookings.html',
  styleUrl: './admin-bookings.css',
})
export class AdminBookings implements OnInit {

  bookings: any[] = [];
  filteredBookings: any[] = [];

  loading = true;
  error = '';

  showEditModal = false;
  selectedBooking: any = null;

    filters = {
    userId: '',
    photographerId: '',
    location: '',
    bookingStatus: '',
    paymentStatus: '',
    packageName: '',
  };

  private apiUrl = 'https://localhost:7272/api/Bookings';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  loadBookings(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: res => {
        this.bookings = res;
        this.filteredBookings = res; 
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load bookings';
        this.loading = false;
      }
    });
  }

  /* ================= SEARCH LOGIC ================= */
  applyFilters(): void {
    this.filteredBookings = this.bookings.filter(b => {

      return (
        (!this.filters.userId || b.userId?.toString().includes(this.filters.userId)) &&
        (!this.filters.photographerId || b.photographerId?.toString().includes(this.filters.photographerId)) &&
        (!this.filters.location || b.eventLocation?.toLowerCase().includes(this.filters.location.toLowerCase())) &&
        (!this.filters.bookingStatus || b.bookingStatus === this.filters.bookingStatus) &&
        (!this.filters.paymentStatus || b.paymentStatus === this.filters.paymentStatus) &&
        (!this.filters.packageName || b.packageName?.toLowerCase().includes(this.filters.packageName.toLowerCase()))
      );
    });
  }


  /* ================= EDIT ================= */
  openEditModal(booking: any): void {
    this.selectedBooking = { ...booking };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedBooking = null;
  }

  updateBooking(): void {
    const id = this.selectedBooking.id ?? this.selectedBooking.bookingId;

    this.http.put(`${this.apiUrl}/${id}`, this.selectedBooking).subscribe({
      next: () => {
        this.loadBookings();
        this.closeEditModal();
        alert('Booking updated successfully');
        window.location.reload();
      },
      error: () => {
        alert('Failed to update booking');
      }
    });
  }

  /* ================= DELETE ================= */
  deleteBooking(id: number): void {
    if (!id) {
      alert('Invalid booking ID');
      return;
    }

    if (!confirm('Are you sure you want to delete this booking?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => {
        this.bookings = this.bookings.filter(b => (b.id ?? b.bookingId) !== id);
        this.loadBookings();
        alert('Booking deleted successfully');

      },
      error: () => {
        alert('Failed to delete booking');
      }
    });
  }
}
