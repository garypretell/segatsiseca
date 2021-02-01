import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IncidenceComponent } from './incidence.component';
import { IncidenceDetailComponent } from './incidence-detail/incidence-detail.component';
import { IncidenceRoutingModule } from './incidence-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [IncidenceComponent, IncidenceDetailComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    IncidenceRoutingModule,
    AgmCoreModule
  ]
})
export class IncidenceModule { }
