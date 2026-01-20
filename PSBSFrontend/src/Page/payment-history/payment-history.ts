import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-history',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payment-history.html',
  styleUrls: ['./payment-history.css']
})
export class PaymentHistory implements OnInit {

  paymentHistory: any[] = [];
  searchText: string = '';
  bookingId!: number;
  isLoading = true;
  errorMessage = '';

  editMode = false;
  selectedPaymentId!: number;

  paymentForm = {
    paymentMethod: '',
    accountNumber: '',
    amount: 0
  };

  private apiUrl = 'https://localhost:7272/api/Bookings/payment';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getPaymentHistory();
    this.getFilteredPayments();
  }

  getPaymentHistory(): void {
    this.http.get<any[]>(`${this.apiUrl}`)
      .subscribe({
        next: (res) => {
          console.log('Payment List:', res);
          this.paymentHistory = res;
          this.cdr.detectChanges();
          this.isLoading = false;
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'Failed to load payment history';
          this.isLoading = false;
        }
      });
  }

  editPayment(payment: any) {
    this.editMode = true;

    this.selectedPaymentId = payment.id || payment.Id;

    this.paymentForm = {
      paymentMethod: payment.paymentMethod || payment.PaymentMethod,
      accountNumber: payment.accountNumber || payment.AccountNumber,
      amount: payment.amount || payment.Amount
    };
  }

  deletePayment(id: number) {
    if (!confirm('Are you sure you want to delete this payment?')) return;

    this.http.delete(
      `https://localhost:7272/api/Bookings/payment-history/${id}`,
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.paymentHistory =
          this.paymentHistory.filter(p => (p.id || p.Id) !== id);
        this.cdr.detectChanges();
        // alert("Payment History deleted successfully");
      },
      error: err => {
        console.error(err);
        alert('Delete failed');
      }
    });
  }

  updatePayment() {
    this.http.put(
      `https://localhost:7272/api/Bookings/payment-history/${this.selectedPaymentId}`,
      this.paymentForm,
      { responseType: 'text' }
    ).subscribe({
      next: () => {
        this.editMode = false;
        this.getPaymentHistory();
        this.cdr.detectChanges();
        alert("Payment History updated successfully");
      },
      error: err => {
        console.error(err);
        alert('Update failed');
      }
    });
  }

  // Search add 
  getFilteredPayments() {
    if (!this.searchText) {
      return this.paymentHistory;
    }

    const text = this.searchText.toLowerCase();

    return this.paymentHistory.filter(payment =>
      (payment.bookingId || payment.BookingId)?.toString().includes(text) ||
      (payment.paymentMethod || payment.PaymentMethod)?.toLowerCase().includes(text) ||
      (payment.accountNumber || payment.AccountNumber)?.toLowerCase().includes(text) ||
      (payment.amount || payment.Amount)?.toString().includes(text)
    );
  }

}
