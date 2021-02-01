import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { UserComponent } from './user.component';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserReportComponent } from './user-report/user-report.component';
import { UserIncidenceComponent } from './user-incidence/user-incidence.component';


const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: UserComponent, pathMatch: 'full' },
      {
        path: ':u',
        children: [
          { path: '', component: UserDetailComponent, pathMatch: 'full' },
          { path: 'report', component: UserReportComponent },
          { path: 'incidences', component: UserIncidenceComponent }
        ]
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule {}