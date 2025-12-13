import { Routes } from '@angular/router';
import { Registration } from '../Page/registration/registration';
import { Login } from '../Page/login/login';
import { AdminDashboard } from '../Page/admin-dashboard/admin-dashboard';
import { ForgotPassword } from '../Page/forgot-password/forgot-password';
import { ResetPassword } from '../Page/reset-password/reset-password';


export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },

    {
        path: 'login',
        component: Login
    },
    {
        path: 'registration',
        component: Registration
    },
    { path: 'forgot-password', component: ForgotPassword },
    { path: 'reset-password', component: ResetPassword },
    {
        path: 'admin-dashboard',
        component: AdminDashboard
    }
];
