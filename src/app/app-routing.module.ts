import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './auth/guards/auth.guard';
import { RequireUnauthGuard } from './auth/guards/require-unauth.guard';



const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [RequireUnauthGuard]
  },
  {
    path: 'Home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    // canActivate: [AuthGuard]
  },
  {
    path: 'usuario',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule)
  },
  {
    path: 'incidence',
    loadChildren: () => import('./incidence/incidence.module').then(m => m.IncidenceModule),
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./verify/verify.module').then(m => m.VerifyModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
   ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
