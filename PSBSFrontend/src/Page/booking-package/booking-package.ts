import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersRegistrationService } from '../../app/Services/users-registration.service';

// for pdf generate
import jsPDF from 'jspdf';

@Component({
  selector: 'app-booking-package',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
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

  // PAYMENT STATE
  showPayment = false;
  paymentMethod = '';
  processingPayment = false;
  paymentSuccess = false;
  createdBookingId = 0;

  mobileNumber: string = '';
  paymentCode: string = '';
  askForCode = false;
  mobileOtp = '';
  askForMobileOtp = false;



  // ⭐ rating API
  private ratingApi = 'https://localhost:7272/api/ReviewRating';

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
  ) { }

  ngOnInit(): void {
    this.loadPhotographers();

    this.route.queryParams.subscribe(params => {
      this.packageId = Number(params['packageId']);
      if (this.packageId && !isNaN(this.packageId)) {
        this.loadPackage(this.packageId);
      }
    });
  }

  // ================= PHOTOGRAPHERS =================
  loadPhotographers(): void {
    this.userService.getAvailablePhotographers().subscribe({
      next: res => {
        this.photographers = res;

        // ADD: load rating for each photographer
        this.photographers.forEach(p => {
          this.loadRatingForPhotographer(p);
        });

        this.cdr.detectChanges();
      }
    });
  }

  // ⭐ ADD ONLY
  loadRatingForPhotographer(p: any) {
    this.http
      .get<any>(`${this.ratingApi}/average/${p.Id}`)
      .subscribe({
        next: res => {
          p.AverageRating = Number(res.AverageRating) || 0;
          p.TotalReviews = Number(res.TotalReviews) || 0;
          this.cdr.detectChanges();
        },
        error: () => {
          p.AverageRating = 0;
          p.TotalReviews = 0;
        }
      });
  }

  // ⭐ helper
  getRoundedRating(rating: number): number {
    return Math.round(rating || 0);
  }

  // ================= PACKAGE =================
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

  // ================= AVAILABILITY =================
  checkAvailability() {
    if (!this.photographerId || !this.booking.EventDate || !this.booking.EventStartTime) {
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
        debugger;
        this.isPhotographerAvailable = res.isAvailable;
        this.availabilityMessage = res.isAvailable ? '' : 'Photographer is already booked';
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

  // ================= BOOKING =================
  submitBooking() {
    // remove previous date and add 2 hours duration packages allow for current date 
    if (!this.isBookingDateValid()) return;

    if (!this.isPhotographerAvailable) return alert('Photographer is already booked');

    const user = localStorage.getItem('user');
    if (user) this.userId = JSON.parse(user).userId;

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

    this.http.post<any>('https://localhost:7272/api/Bookings', payload)
      .subscribe({
        next: res => {
          this.bookingSuccess = true;
          this.createdBookingId = res?.id || 0;
          this.showPayment = true;
          alert('Booking Confirmed');
          this.cdr.detectChanges();
        },
        error: () => alert('Booking Failed')
      });
  }

  // ================= PAYMENT HELPERS =================

  isValidMobile(): boolean {
    return /^\d{11}$/.test(this.mobileNumber);
  }

  isValidCode(): boolean {
    if (this.paymentMethod === 'Bkash') return /^\d{5}$/.test(this.paymentCode);
    if (this.paymentMethod === 'Nagad') return /^\d{4}$/.test(this.paymentCode);
    if (this.paymentMethod === 'Card') return /^\d{16}$/.test(this.paymentCode);
    return false;
  }

  resetPaymentStep() {
    this.askForCode = false;
    this.paymentCode = '';
    this.mobileNumber = '';
    this.paymentSuccess = false;
  }

  // remove previous date and add 2 hours duration packages allow for current date 
  isBookingDateValid(): boolean {

    if (!this.booking.EventDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(this.booking.EventDate);
    selectedDate.setHours(0, 0, 0, 0);

    // ❌ Past date
    if (selectedDate < today) {
      alert('You cannot book for past dates');
      return false;
    }

    // ⚠️ Same day booking rule
    if (selectedDate.getTime() === today.getTime()) {

      if (this.booking.CoverageDurationHours > 2) {
        alert('For today, only 2-hour packages are allowed');
        return false;
      }
    }

    // ✅ Future date or valid today booking
    return true;
  }


  onSendPayment() {

    // STEP 1: Validate mobile number
    // if (!this.mobileNumber || !this.isValidMobile()) {
    //   alert('Please enter a valid 11-digit mobile number');
    //   return;
    // }

    // STEP 2: Send 6-digit OTP to mobile
    // if (!this.askForMobileOtp) {
    //   this.askForMobileOtp = true;
    //   alert('A 6-digit code has been sent to your mobile number');
    //   return;
    // }

    // STEP 3: Verify 6-digit mobile OTP
    // if (!this.mobileOtp || this.mobileOtp.length !== 6) {
    //   alert('Please enter the 6-digit code sent to your mobile');
    //   return;
    // }

    // STEP 4: Show existing paymentCode input (Bkash/Nagad/Card PIN)
    // if (!this.askForCode) {
    //   this.askForCode = true;
    //   return;
    // }

    // STEP 5: Validate existing paymentCode (your logic stays)
    // if (!this.paymentCode || !this.isValidCode()) {
    //   alert('Please enter a valid payment code');
    //   return;
    // }

    // STEP 6: Final payment
    this.generateInvoicePdf();
    this.makePayment();
  }


  makePayment() {

    if (!this.createdBookingId) {
      alert('Booking ID missing');
      return;
    }

    this.processingPayment = true;

    setTimeout(() => {
      this.http.put<any>(
        `https://localhost:7272/api/Bookings/payment/${this.createdBookingId}`,
        {
          paymentStatus: 'Paid',
          paymentMethod: this.paymentMethod
        }
      ).subscribe({
        next: res => {

          // 🔥 EXACTLY LIKE FIRST CONTROLLER
          if (res?.data?.PaymentUrl) {
            window.open(res.data.PaymentUrl, '_blank');
          }

          this.processingPayment = false;
          this.paymentSuccess = true;

          alert('Payment Successful');

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1500);
        },
        error: () => {
          this.processingPayment = false;
          alert('Payment Failed');
        }
      });
    }, 2000);
  }


  // random transaction id generator
  generateTransactionId(): string {
    return 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();
  }


  generateInvoicePdf() {
    const doc = new jsPDF();
    const transactionId = this.generateTransactionId();

    doc.setFontSize(18);
    doc.text('INVOICE FOR BOOKING PACKAGES', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Booking ID: ${this.createdBookingId}`, 20, 40);
    doc.text(`Transaction ID: ${transactionId}`, 20, 50);
    doc.text(`Payment Method: ${this.paymentMethod}`, 20, 60);
    doc.text(`Mobile Number: ${this.mobileNumber}`, 20, 70);
    doc.text(`Amount Paid: ৳ ${this.booking.Price}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);

    doc.line(20, 100, 190, 100);

    doc.text('Thank you for your payment! Stay With Us.', 20, 120);
    doc.text('Photography Service Booking System', 20, 130);

    const logo = new Image();
    logo.src = '/assets/img/Application_logo.png';

    logo.onload = () => {
      const logoWidth = 70;   // 🔹 একটু বড়
      const logoHeight = 35;  // 🔹 proportional

      const pageWidth = doc.internal.pageSize.getWidth();
      const xCenter = (pageWidth - logoWidth) / 2;

      doc.addImage(logo, 'PNG', xCenter, 145, logoWidth, logoHeight);
      doc.save(`BookingInvoice_${this.createdBookingId}_${transactionId}.pdf`);
    };

  };
}

