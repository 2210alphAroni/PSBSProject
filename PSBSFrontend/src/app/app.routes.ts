import { Routes } from '@angular/router';
import { Registration } from '../Page/registration/registration';
import { Login } from '../Page/login/login';
import { AdminDashboard } from '../Page/admin-dashboard/admin-dashboard';
import { ForgotPassword } from '../Page/forgot-password/forgot-password';
import { ResetPassword } from '../Page/reset-password/reset-password';
import { AdminUsers } from '../Page/admin-users/admin-users';
import { AdminPackages } from '../Page/admin-packages/admin-packages';
import { Home } from '../Page/home/home';
import { Profile } from '../Page/profile/profile';
import { BookingPackage } from '../Page/booking-package/booking-package';
import { AllPackages } from '../Page/all-packages/all-packages';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path:'home',
    component: Home
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'booking-package',
    component: BookingPackage
  },
  {
    path: 'all-packages',
    component: AllPackages
  },
  {
    path: 'profile',
    component: Profile
  },
  {
    path: 'registration',
    component: Registration
  },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },

  // ADMIN DASHBOARD WITH CHILD ROUTES
  {
  path: 'admin-dashboard',
  component: AdminDashboard,
  children: [
    {
      path: 'users',
      component: AdminUsers
    },
    {
      path: 'admin-packages',
      component: AdminPackages
    }
  ]
}

];
