import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-photographer-portfolio',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './photographer-portfolio.html'
})
export class PhotographerPortfolio implements OnInit {

  apiUrl = 'https://localhost:7272/api/PhotographerPortfolio';

  portfolios: any[] = [];

  portfolio = {
    id: 0,
    title: '',
    category: '',
    description: ''
  };

  selectedFile: File | null = null;
  previewImage: string | null = null;

  categories: string[] = [
    'Wedding Photography',
    'Reception Photography',
    'Birthday Event',
    'Corporate Event',
    'Pre-wedding Shoot',
    'Baby Shoot',
    'Product Photography',
    'Fashion Photography'
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadPortfolio();
  }

  // 🔄 Load portfolio list
  loadPortfolio(): void {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: res => this.portfolios = res,
      error: err => console.error('Load error:', err),
      complete: () => this.cdr.detectChanges()
    });
  }

  // 📁 File select + preview (FULL FIX)
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file: File = input.files[0];
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImage = reader.result as string;
    };
    reader.readAsDataURL(file); // ✅ FIXED (no null error)
  }

  // 💾 Create / Update
  savePortfolio(): void {

    if (!this.portfolio.title || !this.portfolio.category) {
      return;
    }

    const formData = new FormData();
    formData.append('title', this.portfolio.title);
    formData.append('category', this.portfolio.category);
    formData.append('description', this.portfolio.description ?? '');

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    // ➕ CREATE
    if (this.portfolio.id === 0) {
      this.http.post(this.apiUrl, formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadPortfolio();
        },
        error: err => console.error('Create error:', err)
      });
    }
    // ✏ UPDATE
    else {
      this.http.put(`${this.apiUrl}/${this.portfolio.id}`, formData).subscribe({
        next: () => {
          this.resetForm();
          this.loadPortfolio();
        },
        error: err => console.error('Update error:', err)
      });
    }
  }

  // ✏ Edit
  editPortfolio(item: any): void {
    this.portfolio = {
      id: item.id,
      title: item.title,
      category: item.category,
      description: item.description
    };

    this.previewImage = item.imageUrl;
    this.selectedFile = null;
  }

  // 🗑 Delete
  deletePortfolio(id: number): void {
    if (!confirm('Are you sure you want to delete this portfolio?')) {
      return;
    }

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.loadPortfolio(),
      error: err => console.error('Delete error:', err)
    });
  }

  // ♻ Reset form
  resetForm(): void {
    this.portfolio = {
      id: 0,
      title: '',
      category: '',
      description: ''
    };
    this.selectedFile = null;
    this.previewImage = null;
  }
}
