import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

/* ================= PACKAGE MODEL ================= */
export interface Package {
  id: number;
  name: string;
  description: string;
  duration: string;
  editedPhotos: string;
  rawFiles: boolean;
  price: number;
  addOns: string[];
}

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './packages.html',
  styleUrl: './packages.css',
})
export class Packages implements OnInit {

  /* ================= STATE ================= */
  packages: Package[] = [];
  selectedPackage: Package | null = null;

  isLoading = false;

  private apiUrl = 'https://localhost:7272/api/packages';

  constructor(private http: HttpClient) {}

  /* ================= LIFECYCLE ================= */
  ngOnInit(): void {
    this.loadPackages();
  }

  /* ================= LOAD PACKAGES ================= */
  loadPackages(): void {
    this.isLoading = true;

    this.http.get<Package[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.packages = res ?? [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load packages', err);
        this.isLoading = false;
      }
    });
  }

  /* ================= OPEN EDIT MODAL ================= */
  openEdit(pkg: Package): void {
    // clone to avoid premature UI mutation
    this.selectedPackage = { ...pkg };
  }

  /* ================= OPEN DELETE MODAL ================= */
  openDelete(pkg: Package): void {
    this.selectedPackage = pkg;
  }

  /* ================= DELETE PACKAGE ================= */
  deletePackage(): void {
    if (!this.selectedPackage) return;

    this.http
      .delete(`${this.apiUrl}/${this.selectedPackage.id}`)
      .subscribe({
        next: () => {
          this.packages = this.packages.filter(
            p => p.id !== this.selectedPackage!.id
          );

          this.closeDeleteModal();
          this.selectedPackage = null;
        },
        error: (err) => {
          console.error('Delete failed', err);
        }
      });
  }

  /* ================= CLOSE DELETE MODAL ================= */
  private closeDeleteModal(): void {
    const btn = document.getElementById('closeDeletePackageModalBtn');
    btn?.click();
  }
}
