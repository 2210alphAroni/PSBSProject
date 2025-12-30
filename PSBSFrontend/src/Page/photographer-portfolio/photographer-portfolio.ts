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
    'Wedding',
    'Reception',
    'Birthday',
    'Corporate',
    'Pre-wedding',
    'Baby',
    'Product',
    'Fashion'
  ];

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadPortfolio();
  }

  loadPortfolio() {
    this.http.get<any[]>(this.apiUrl)
      .subscribe(res => {
        console.log(res);
        this.portfolios = res;
        this.cdr.detectChanges();
      });
  }

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];

    const reader = new FileReader();
    reader.onload = () => this.previewImage = reader.result as string;
    reader.readAsDataURL(this.selectedFile!);
  }

  savePortfolio() {

    const formData = new FormData();
    formData.append('title', this.portfolio.title);
    formData.append('category', this.portfolio.category);
    formData.append('description', this.portfolio.description);

    if (this.selectedFile)
      formData.append('image', this.selectedFile);

    if (this.portfolio.id === 0) {
      this.http.post(this.apiUrl, formData)
        .subscribe(() => {
          this.reset();
          this.loadPortfolio();
        });
    } else {
      this.http.put(`${this.apiUrl}/${this.portfolio.id}`, formData)
        .subscribe(() => {
          this.reset();
          this.loadPortfolio();
        });
    }
  }

  // =========================
  // EDIT (FIXED)
  // =========================
  editPortfolio(item: any) {
    this.selectedFile = null; // important for update without image

    this.portfolio = {
      id: item.Id,                     // ✅ FIX (Id not id)
      title: item.Title,
      category: item.Category,
      description: item.Description
    };

    this.previewImage = item.ImageUrl; // ✅ FIX
  }

  // =========================
  // DELETE (FIXED)
  // =========================
  deletePortfolio(id: number) {
    if (!confirm('Delete this Portfolio Image?')) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe(() => {
      this.loadPortfolio();
    });
  }

  // =========================
  // RESET (OK, unchanged)
  // =========================
  reset() {
    this.portfolio = { id: 0, title: '', category: '', description: '' };
    this.selectedFile = null;
    this.previewImage = null;
  }

}
