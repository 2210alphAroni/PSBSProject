import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pending-bookings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './pending-bookings.html',
  styleUrl: './pending-bookings.css'
})
export class PendingBookings implements OnInit {

  userId!: number;
  pendingBookings: any[] = [];
  loading = false;

  // 🔹 BKASH MODAL STATE
  showBkashModal = false;
  bkashStep = 1;

  bkashNumber = '';
  bkashOtp = '';
  bkashPin = '';

  bkashProcessing = false;
  bkashSuccess = false;

  selectedBookingId!: number;
  selectedAmount = 0;
  selectedPaymentType: 'FULL' | 'PARTIAL' = 'FULL';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('User not logged in');
      return;
    }

    this.userId = JSON.parse(userStr).userId;
    this.loadPendingBookings();
  }

  loadPendingBookings() {
    this.http.get<any[]>(
      `https://localhost:7272/api/Bookings/user/${this.userId}/pending-payments`
    )
      .subscribe(res => {
        console.log(res)
        this.pendingBookings = [...res];
        this.cdr.detectChanges();
      });
  }


  // ================= BKASH =================

  payNow(booking: any, type: 'FULL' | 'PARTIAL') {

    this.selectedBookingId = booking.Id;
    this.selectedPaymentType = type;

    if (type === 'FULL') {
      this.selectedAmount = booking.TotalPrice - booking.PaidAmount;
    } else {
      this.selectedAmount = booking.TotalPrice * 0.3;
    }

    this.resetBkash();
    this.showBkashModal = true;
  }

  resetBkash() {
    this.bkashStep = 1;
    this.bkashNumber = '';
    this.bkashOtp = '';
    this.bkashPin = '';
    this.bkashProcessing = false;
    this.bkashSuccess = false;
  }

  closeBkashModal() {
    this.showBkashModal = false;
  }

  sendOtp() {
    if (!/^01\d{9}$/.test(this.bkashNumber)) {
      alert('Enter valid bKash number');
      return;
    }
    this.bkashStep = 2;
  }

  verifyOtp() {
    if (!/^\d{6}$/.test(this.bkashOtp)) {
      alert('Invalid OTP');
      return;
    }
    this.bkashStep = 3;
  }

  confirmBkashPayment() {
    if (!/^\d{5}$/.test(this.bkashPin)) {
      alert('Invalid bKash PIN');
      return;
    }

    this.bkashProcessing = true;

    this.http.put(
      `https://localhost:7272/api/Bookings/payment/${this.selectedBookingId}`,
      {
        paymentMethod: 'Bkash',
        amount: this.selectedAmount,
        paymentType: this.selectedPaymentType,
        accountNumber: this.bkashNumber   // ✅ MUST
      }
    ).subscribe({
      next: () => {
        this.bkashProcessing = false;
        this.bkashSuccess = true;

        setTimeout(() => {
          this.showBkashModal = false;
          this.loadPendingBookings();
        }, 1000);
      },
      error: () => {
        this.bkashProcessing = false;
        alert('Payment failed');
      }
    });
  }

}
