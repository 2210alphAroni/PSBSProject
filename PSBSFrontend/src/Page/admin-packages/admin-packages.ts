import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { RouterModule } from "@angular/router";

export interface Package {
  id: number;
  packageName: string;
  description: string;
  coverageDurationHours: number;
  maxEditedPhotos: number;
  rawFilesAvailable: boolean;
  basePrice: number;
}

@Component({
  selector: 'app-admin-packages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-packages.html'
})
export class AdminPackages implements OnInit {

  packages: Package[] = [];

  showForm = false;
  isEditMode = false;
  saving = false;

  formModel: Package = this.emptyPackage();

  private apiUrl = 'https://localhost:7272/api/Packages';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  // ============ LOAD ============
  loadPackages(): void {
    this.http.get<Package[]>(this.apiUrl).subscribe({
      next: (res) => this.packages = res,
      error: (err) => this.handleHttpError('Load failed', err)
    });
  }

  // ============ OPEN ADD ============
  addNew(): void {
    this.showForm = true;
    this.isEditMode = false;
    this.formModel = this.emptyPackage();
  }

  // ============ OPEN EDIT ============
  edit(pkg: Package): void {
    this.showForm = true;
    this.isEditMode = true;
    this.formModel = { ...pkg };
  }

  // ============ SAVE (ADD/UPDATE) ============
  save(): void {
    if (!this.formModel.packageName?.trim()) {
      alert('Package name is required');
      return;
    }

    this.saving = true;

    const payload: Package = {
      ...this.formModel,
      basePrice: Number(this.formModel.basePrice),
      coverageDurationHours: Number(this.formModel.coverageDurationHours),
      maxEditedPhotos: Number(this.formModel.maxEditedPhotos),
    };

    if (this.isEditMode) {
      this.http.put(`${this.apiUrl}/${payload.id}`, payload).subscribe({
        next: () => {
          this.saving = false;
          this.cancel();
          this.loadPackages();
        },
        error: (err) => {
          this.saving = false;
          this.handleHttpError('Update failed', err);
        }
      });
    } else {
      // IMPORTANT: backend should return the created Package object
      this.http.post<Package>(this.apiUrl, payload).subscribe({
        next: (created) => {
          this.saving = false;
          this.cancel();

          // Fast UI update (no need to wait)
          if (created?.id) {
            this.packages = [created, ...this.packages];
          } else {
            this.loadPackages();
          }
        },
        error: (err) => {
          this.saving = false;
          this.handleHttpError('Add failed', err);
        }
      });
    }
  }

  // ============ DELETE ============
  delete(pkg: Package): void {
    if (!confirm(`Delete package "${pkg.packageName}"?`)) return;

    this.http.delete(`${this.apiUrl}/${pkg.id}`).subscribe({
      next: () => {
        this.packages = this.packages.filter(p => p.id !== pkg.id);
      },
      error: (err) => this.handleHttpError('Delete failed', err)
    });
  }

  // ============ CANCEL ============
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
    const e = err as HttpErrorResponse;
    console.error(title, e);

    // This alert will show the REAL reason (400/500/CORS/etc.)
    alert(`${title}\nStatus: ${e.status}\n${typeof e.error === 'string' ? e.error : JSON.stringify(e.error)}`);
  }
}
