import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserReportComponent } from './user-report/user-report.component';
import { UserIncidenceComponent } from './user-incidence/user-incidence.component';
import { UserListadoComponent } from './user-listado/user-listado.component';
import { UserAreaComponent } from './user-area/user-area.component';
import { AdminGuard, EditorGuard, SuperGuard } from '../auth/guards';
import { PageNotFoundComponent } from '../shared/components/page-not-found/page-not-found.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: UserComponent, pathMatch: 'full',  canActivate: [EditorGuard] },
      { path: 'buscar', component: UserListadoComponent ,  canActivate: [AdminGuard]},
      { path: 'area', component: UserAreaComponent,  canActivate: [EditorGuard] },
      {
        path: ':u',
        children: [
          { path: '', component: UserDetailComponent, pathMatch: 'full' },
          { path: 'report', component: UserReportComponent},
          { path: 'incidences', component: UserIncidenceComponent }
        ]
      }
    ]
  },
  {
    path: '**',
    component: PageNotFoundComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}
