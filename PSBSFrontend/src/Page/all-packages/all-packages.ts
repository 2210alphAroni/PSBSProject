import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Package } from '../../app/models/package.model';
@Component({
  selector: 'app-all-packages',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './all-packages.html'
})
export class AllPackagesComponent implements OnInit {

  packages: Package[] = [];
  selectedPackage: Package | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages() {
    this.http.get<Package[]>('https://localhost:7272/api/Packages')
      .subscribe({
        next: res => this.packages = res,
        error: err => console.error(err)
      });
  }

  openModal(pkg: Package) {
    this.selectedPackage = pkg;
  }
}
