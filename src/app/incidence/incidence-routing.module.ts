import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { IncidenceComponent } from './incidence.component';
import { IncidenceDetailComponent } from './incidence-detail/incidence-detail.component';
import { IncidenceListadoComponent } from './incidence-listado/incidence-listado.component';
import { IncidenceAreaComponent } from './incidence-area/incidence-area.component';
import { IncidenceReporteComponent } from './incidence-reporte/incidence-reporte.component';
import { PageNotFoundComponent } from '../shared/components/page-not-found/page-not-found.component';
import { IncidenceBuscarComponent } from './incidence-buscar/incidence-buscar.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: IncidenceComponent, pathMatch: 'full' },
      { path: 'listado', component: IncidenceListadoComponent },
      { path: 'area', component: IncidenceAreaComponent },
      { path: 'reporte', component: IncidenceReporteComponent },
      { path: 'buscar', component: IncidenceBuscarComponent },
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
