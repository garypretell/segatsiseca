import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IncidenceComponent } from './incidence.component';
import { IncidenceDetailComponent } from './incidence-detail/incidence-detail.component';
import { IncidenceListadoComponent } from './incidence-listado/incidence-listado.component';
import { IncidenceAreaComponent } from './incidence-area/incidence-area.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IncidenceComponent, pathMatch: 'full' },
      { path: 'listado', component: IncidenceListadoComponent },
      { path: 'area', component: IncidenceAreaComponent },
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
