import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminGuard, EditorGuard } from './auth/guards';
import { AuthGuard } from './auth/guards/auth.guard';
import { RequireUnauthGuard } from './auth/guards/require-unauth.guard';
import { PageNotFoundComponent } from './shared/components/page-not-found/page-not-found.component';


const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule),
    canActivate: [RequireUnauthGuard]
  },
  {
    path: 'Home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'usuario',
    loadChildren: () => import('./user/user.module').then(m => m.UserModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'incidence',
    loadChildren: () => import('./incidence/incidence.module').then(m => m.IncidenceModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'supervisor',
    loadChildren: () => import('./supervisor/supervisor.module').then(m => m.SupervisorModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'verify-email',
    loadChildren: () => import('./verify/verify.module').then(m => m.VerifyModule)
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes)
   ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
