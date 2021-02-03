import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenceComponent } from './incidence.component';
import { IncidenceDetailComponent } from './incidence-detail/incidence-detail.component';
import { IncidenceRoutingModule } from './incidence-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';
import { IncidenceListadoComponent } from './incidence-listado/incidence-listado.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { IncidenceAreaComponent } from './incidence-area/incidence-area.component';
import { DragScrollModule } from 'ngx-drag-scroll';
import { NgImageSliderModule } from 'ng-image-slider';
import { IncidenceReporteComponent } from './incidence-reporte/incidence-reporte.component';

@NgModule({
  declarations: [IncidenceComponent, IncidenceDetailComponent, IncidenceListadoComponent, IncidenceAreaComponent, IncidenceReporteComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    IncidenceRoutingModule,
    AgmCoreModule,
    NgxPaginationModule,
    FilterPipeModule,
    DragScrollModule,
    NgImageSliderModule
  ]
})
export class IncidenceModule { }
