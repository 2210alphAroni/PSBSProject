import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portfolios',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolios.html',
  styleUrl: './portfolios.css'
})
export class Portfolios implements OnInit {

  // ===============================
  // CATEGORY LIST
  // ===============================
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

  activeCategory: string = 'Wedding';

  // ===============================
  // DATA HOLDERS
  // ===============================
  filteredPortfolios: any[] = [];
  photographerId: number | null = null;

  // ===============================
  // API URL
  // ===============================
  apiUrl = 'https://localhost:7272/api/PhotographerPortfolio';

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  // ===============================
  // INIT
  // ===============================
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = Number(params['photographerId']);

      if (!id) {
        console.error('❌ Photographer ID not found in query params');
        return;
      }

      this.photographerId = id;
      this.loadCategoryWise(this.activeCategory);
    });
  }

  // ===============================
  // LOAD PORTFOLIOS BY CATEGORY
  // ===============================
  loadCategoryWise(category: string): void {
    if (!this.photographerId) return;

    this.http.get<any[]>(
      `${this.apiUrl}/by-photographer?photographerId=${this.photographerId}&category=${category}`
    ).subscribe({
      next: res => {
        this.filteredPortfolios = res || [];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('❌ Failed to load portfolios', err);
      }
    });
  }

  // ===============================
  // CATEGORY TAB CHANGE
  // ===============================
  changeCategory(category: string): void {
    this.activeCategory = category;
    this.loadCategoryWise(category);
  }
}
