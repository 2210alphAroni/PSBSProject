import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-payments.html',
  styleUrl: './admin-payments.css',
})
export class AdminPayments implements OnInit {

  payments: any[] = [];
  loading = true;
  error = '';

  showEditModal = false;
  selectedPayment: any = null;

  private apiUrl = 'https://localhost:7272/api/Bookings';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadPayments();
  }

  /* ================= LOAD ================= */
  loadPayments(): void {
    this.loading = true;

    this.http.get<any[]>(this.apiUrl).subscribe({
      next: res => {
        this.payments = res;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.error = 'Failed to load payments';
        this.loading = false;
      }
    });
  }

  /* ================= EDIT ================= */
  openEditModal(payment: any): void {
    this.selectedPayment = { ...payment };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedPayment = null;
  }

  updatePayment(): void {
    const id = this.selectedPayment.id ?? this.selectedPayment.bookingId;

    this.http.put(`${this.apiUrl}/${id}`, this.selectedPayment)
      .subscribe({
        next: () => {
          alert('Payment updated successfully');
          this.closeEditModal();
          this.loadPayments();
        },
        error: () => {
          alert('Failed to update payment');
        }
      });
  }

  /* ================= DELETE ================= */
  deletePayment(id: number): void {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    this.http.delete(`${this.apiUrl}/${id}`)
      .subscribe({
        next: () => {
          alert('Payment deleted successfully');
          this.loadPayments();
        },
        error: () => {
          alert('Failed to delete payment');
        }
      });
  }
}
