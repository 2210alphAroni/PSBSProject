import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {

  private apiUrl = 'https://localhost:7272/api/Contact';

  contactData = {
    name: '',
    email: '',
    subject: '',
    message: ''
  };

  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(private http: HttpClient) {}

  // ================= SUBMIT CONTACT FORM =================
  submitForm() {
    this.successMessage = '';
    this.errorMessage = '';

    if (!this.contactData.name || !this.contactData.email || !this.contactData.message) {
      this.errorMessage = 'Please fill all required fields.';
      return;
    }

    this.isSubmitting = true;

    this.http.post<any>(this.apiUrl, this.contactData).subscribe({
      next: (res) => {
        this.successMessage = 'Your message has been sent successfully!';
        alert(this.successMessage);
        this.isSubmitting = false;
        window.location.reload();
        this.resetForm();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to send message. Please try again.';
        alert(this.errorMessage);
        window.location.reload();
        this.isSubmitting = false;
      }
    });
  }

  // ================= RESET FORM =================
  resetForm() {
    this.contactData = {
      name: '',
      email: '',
      subject: '',
      message: ''
    };
  }
}
