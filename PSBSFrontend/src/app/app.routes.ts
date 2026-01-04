// import { Routes } from '@angular/router';
// import { Registration } from '../Page/registration/registration';
// import { Login } from '../Page/login/login';
// import { AdminDashboard } from '../Page/admin-dashboard/admin-dashboard';
// import { ForgotPassword } from '../Page/forgot-password/forgot-password';
// import { ResetPassword } from '../Page/reset-password/reset-password';
// import { AdminUsers } from '../Page/admin-users/admin-users';
// import { AdminPackages } from '../Page/admin-packages/admin-packages';
// import { Home } from '../Page/home/home';
// import { Profile } from '../Page/profile/profile';
// import { BookingPackage } from '../Page/booking-package/booking-package';
// import { AllPackages } from '../Page/all-packages/all-packages';

// export const routes: Routes = [
//   {
//     path: '',
//     redirectTo: 'home',
//     pathMatch: 'full'
//   },
//   {
//     path:'home',
//     component: Home
//   },
//   {
//     path: 'login',
//     component: Login
//   },
//   {
//     path: 'booking-package',
//     component: BookingPackage
//   },
//   {
//     path: 'all-packages',
//     component: AllPackages
//   },
//   {
//     path: 'profile',
//     component: Profile
//   },
//   {
//     path: 'registration',
//     component: Registration
//   },
//   { path: 'forgot-password', component: ForgotPassword },
//   { path: 'reset-password', component: ResetPassword },


//   {
//   path: 'admin-dashboard',
//   component: AdminDashboard,
//   children: [
//     {
//       path: 'users',
//       component: AdminUsers
//     },
//     {
//       path: 'admin-packages',
//       component: AdminPackages
//     }
//   ]
// }

// ];


import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './shared/layout/layout';

// PUBLIC PAGES
import { Home } from '../Page/home/home';
import { AllPackages } from '../Page/all-packages/all-packages';
import { BookingPackage } from '../Page/booking-package/booking-package';
import { Profile } from '../Page/profile/profile';
import { About } from '../Page/about/about';
import { Contact } from '../Page/contact/contact';
import { PrivacyPolicy } from '../Page/privacy-policy/privacy-policy';
import { TermsUse } from '../Page/terms-use/terms-use';
import { ReviewRating } from '../Page/review-rating/review-rating';


// AUTH PAGES
import { Login } from '../Page/login/login';
import { Registration } from '../Page/registration/registration';
import { ForgotPassword } from '../Page/forgot-password/forgot-password';

// ADMIN PAGES
import { AdminDashboard } from '../Page/admin-dashboard/admin-dashboard';
import { AdminUsers } from '../Page/admin-users/admin-users';
import { AdminPackages } from '../Page/admin-packages/admin-packages';
import { AdminBookings } from '../Page/admin-bookings/admin-bookings';
import { AdminPayments } from '../Page/admin-payments/admin-payments';
import { AdminSettings } from '../Page/admin-settings/admin-settings';

//Photographer Dashboard can be added similarly
import { PhotographerDashboard } from '../Page/photographer-dashboard/photographer-dashboard';
import { PhotographerProfile } from '../Page/photographer-profile/photographer-profile';
import { PhotographerPortfolio } from '../Page/photographer-portfolio/photographer-portfolio';
import { PhotoByCat } from '../Page/photo-by-cat/photo-by-cat';

export const routes: Routes = [

  // 🌐 PUBLIC PAGES → HEADER + FOOTER
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: Home, pathMatch: 'full' },
      { path: 'home', component: Home },
      { path: 'all-packages', component: AllPackages },
      { path: 'about', component: About },
      { path: 'contact', component: Contact },
      { path: 'photos-by-category', component: PhotoByCat },
      { path: 'privacy-policy', component: PrivacyPolicy },
      { path: 'terms-use', component: TermsUse },
      { path: 'booking-package', component: BookingPackage },
      { path: 'review-rating', component: ReviewRating },

    ]
  },

  // 🔐 AUTH PAGES → NO HEADER / FOOTER
  { path: 'login', component: Login },
  { path: 'registration', component: Registration },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'profile', component: Profile },

  // 🛠 ADMIN PAGES → NO HEADER / FOOTER
  {
    path: 'admin-dashboard',
    component: AdminDashboard,
    children: [
      { path: 'users', component: AdminUsers },
      { path: 'admin-packages', component: AdminPackages },
      { path: 'admin-bookings', component: AdminBookings },
      { path: 'admin-payments', component: AdminPayments },
      { path: 'admin-settings', component: AdminSettings },
    ]
  },

  // 📸 PHOTOGRAPHER PAGES → NO HEADER / FOOTER
  {
    path: 'photographer-dashboard',
    component: PhotographerDashboard,
    children: [
      { path: 'photographer-profile', component: PhotographerProfile },
      { path: 'photographer-portfolio', component: PhotographerPortfolio },
    ]
  },
  
  // 🔥 FIX REFRESH ISSUE (wildcard-route)
  // { path: '**', redirectTo: '', pathMatch: 'full' }

];
