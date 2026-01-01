import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from "@angular/router";

/* ================= PACKAGES ================= */
export interface Package {
  id: number;
  packageName: string;
  description: string;
  coverageDurationHours: number;
  maxEditedPhotos: number;
  rawFilesAvailable: boolean;
  basePrice: number;
}

/* ================= PORTFOLIO ================= */
export interface Portfolio {
  Id: number;
  Title: string;
  Category: string;
  Description: string;
  ImageUrl: string;
  IsApproved: boolean;
}

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-packages.html'
})
export class AdminPackages implements OnInit {

  /* ================= PACKAGE LOGIC ================= */
  packages: Package[] = [];
  rejectPortfolioId: number | null = null;
  rejectReason: string = '';

  showForm = false;
  isEditMode = false;
  saving = false;
  searchText = '';

  formModel: Package = this.emptyPackage();
  private apiUrl = 'https://localhost:7272/api/Packages';

  /* ================= PORTFOLIO LOGIC ================= */
  private portfolioApi =
    'https://localhost:7272/api/PhotographerPortfolio/pending';


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

  portfolios: Portfolio[] = [];
  filteredPortfolios: Portfolio[] = [];

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.loadPackages();
    this.loadAllPortfolios();
  }

  /* ================= PACKAGE FUNCTIONS ================= */
  filteredPackages(): Package[] {
    if (!this.searchText) return this.packages;

    const text = this.searchText.toLowerCase();
    return this.packages.filter(pkg =>
      pkg.packageName.toLowerCase().includes(text) ||
      pkg.description.toLowerCase().includes(text)
    );
  }

  loadPackages(): void {
    this.http.get<Package[]>(this.apiUrl).subscribe({
      next: res => this.packages = res,
      error: err => this.handleHttpError('Package load failed', err),
      complete: () => this.cdr.detectChanges()
    });
  }

  addNew(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.formModel = this.emptyPackage();
  }

  edit(pkg: Package): void {
    this.showForm = true;
    this.isEditMode = true;
    this.formModel = { ...pkg };
  }

  save(): void {
    if (!this.formModel.packageName?.trim()) return;

    const payload: Package = {
      ...this.formModel,
      basePrice: Number(this.formModel.basePrice),
      coverageDurationHours: Number(this.formModel.coverageDurationHours),
      maxEditedPhotos: Number(this.formModel.maxEditedPhotos),
    };

    const req = this.isEditMode
      ? this.http.put(`${this.apiUrl}/${payload.id}`, payload)
      : this.http.post(this.apiUrl, payload);

    req.subscribe(() => {
      this.cancel();
      this.loadPackages();
    });
  }

  delete(pkg: Package): void {
    if (!confirm(`Delete "${pkg.packageName}"?`)) return;

    this.http.delete(`${this.apiUrl}/${pkg.id}`).subscribe(() => {
      this.packages = this.packages.filter(p => p.id !== pkg.id);
    });
  }

  cancel(): void {
    this.showForm = false;
    this.isEditMode = false;
    this.formModel = this.emptyPackage();
  }

  private emptyPackage(): Package {
    return {
      id: 0,
      packageName: '',
      description: '',
      coverageDurationHours: 0,
      maxEditedPhotos: 0,
      rawFilesAvailable: false,
      basePrice: 0
    };
  }

  private handleHttpError(title: string, err: unknown): void {
    console.error(title, err);
  }

  /* ================= PORTFOLIO FUNCTIONS ================= */

  loadAllPortfolios(): void {
    this.http.get<Portfolio[]>(this.portfolioApi).subscribe({
      next: res => {
        console.log('All Portfolios:', res); // for debugging
        // this.portfolios = res.filter(p => p.IsApproved === true);
        this.portfolios = res;
        this.applyCategoryFilter();
        this.cdr.detectChanges();
      },
      error: err =>
        this.handleHttpError('Portfolio load failed', err)
    });
  }

  changeCategory(category: string): void {
    this.activeCategory = category;
    this.applyCategoryFilter();
    this.cdr.detectChanges();
  }

  applyCategoryFilter(): void {
    this.filteredPortfolios = this.portfolios.filter(
      p => p.Category === this.activeCategory
    );
  }

  approvePortfolio(id: number): void {

    if (!confirm('Approve this portfolio?')) return;

    const approveUrl =
      `https://localhost:7272/api/PhotographerPortfolio/approve/${id}`;

    this.http.put(approveUrl, {}).subscribe({
      next: () => {

        // 🔥 UI থেকে remove
        this.portfolios = this.portfolios.filter(p => p.Id !== id);
        this.applyCategoryFilter();

        alert('Portfolio approved successfully');

        this.cdr.detectChanges();
      },
      error: err =>
        this.handleHttpError('Approve failed', err)
    });

  }

  // open modal showing reason for rejection
  openRejectModal(id: number): void {
  this.rejectPortfolioId = id;
  this.rejectReason = '';

  const modal = new (window as any).bootstrap.Modal(
    document.getElementById('rejectModal')
  );
  modal.show();
}
  
// confirm rejection with reason
confirmReject(): void {

  if (!this.rejectReason.trim()) {
    alert('Reject reason is required');
    return;
  }

  const url =
    `https://localhost:7272/api/PhotographerPortfolio/reject/${this.rejectPortfolioId}`;

  this.http.put(url, {
    rejectReason: this.rejectReason
  }).subscribe(() => {

    // remove from admin list
    this.portfolios = this.portfolios.filter(
      p => p.Id !== this.rejectPortfolioId
    );
    this.applyCategoryFilter();

    // close modal
    const modalEl = document.getElementById('rejectModal');
    const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
    modal.hide();

    alert('Portfolio rejected');
    window.setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

    // reset

    this.rejectPortfolioId = null;
    this.rejectReason = '';
  });
}



}
