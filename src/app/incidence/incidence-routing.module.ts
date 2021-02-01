import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IncidenceComponent } from './incidence.component';
import { IncidenceDetailComponent } from './incidence-detail/incidence-detail.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IncidenceComponent, pathMatch: 'full' },
      {
        path: ':i',
        children: [
          { path: '', component: IncidenceDetailComponent, pathMatch: 'full' }
        //   { path: 'report', component: UserReportComponent },
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
export class IncidenceRoutingModule {}
