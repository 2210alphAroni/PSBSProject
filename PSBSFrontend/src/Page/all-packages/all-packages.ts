import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient} from '@angular/common/http';
import { Package } from '../../app/models/package.model';
import { RouterModule } from "@angular/router";

@Component({
  selector: 'app-all-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './all-packages.html',
  styleUrls: ['./all-packages.css']
})
export class AllPackages implements OnInit {

  packages: Package[] = [];
  selectedPackage: Package | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadPackages();
  }

  loadPackages(): void {
    this.http.get<Package[]>('https://localhost:7272/api/Packages')
      .subscribe({
        next: (res) => {
          console.log('Packages:', res); // helpful debug
          this.packages = res;
        },
        error: (err) => console.error('API error:', err)
      });
  }

  openModal(pkg: Package): void {
    this.selectedPackage = pkg;
  }
}
