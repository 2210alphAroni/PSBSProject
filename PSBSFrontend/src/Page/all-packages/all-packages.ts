import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Package } from '../../app/models/package.model';
import { RouterModule, Router } from "@angular/router";
import { AuthService } from '../../app/Services/auth.service';
import { ActivatedRoute } from '@angular/router';



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
  filteredPackages: Package[] = [];
  searchKeyword: string = '';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit(): void {

    // 🔥 query param listen
  this.route.queryParams.subscribe(params => {
    this.searchKeyword = params['search'] || '';
    this.applyFilter();
  });

    this.loadPackages();
  }

  loadPackages(): void {
    this.http.get<Package[]>('https://localhost:7272/api/Packages')
      .subscribe({
        next: (res) => {
          console.log('Packages:', res); // helpful debug
          this.packages = res;
          this.filteredPackages = res;
          this.applyFilter(); 
          this.cdr.detectChanges();  
        },
        error: (err) => console.error('API error:', err)
      });
  }


  // Handle package click modal logic
  handlePackageClick(pkg: Package): void {

    // ❌ Not logged in → redirect to login
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], {
        queryParams: { reason: 'booking_required' }
      });
      return;
    }

    // ✅ Logged in → open modal
    this.selectedPackage = pkg;
    this.cdr.detectChanges();

    const modalEl = document.getElementById('packageModal');
    if (modalEl) {
      // @ts-ignore
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  // from navbar search to search all packages 
  applyFilter(): void {

  if (!this.searchKeyword) {
    this.filteredPackages = this.packages;
    return;
  }

  const keyword = this.searchKeyword.toLowerCase();

  this.filteredPackages = this.packages.filter(pkg =>
    pkg.packageName?.toLowerCase().includes(keyword) ||
    pkg.description?.toLowerCase().includes(keyword)
  );
}


}
