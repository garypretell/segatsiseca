import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupervisorComponent } from './supervisor.component';
import { SupervisorRoutingModule } from './supervisor-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { NgxPaginationModule } from 'ngx-pagination';



@NgModule({
  declarations: [SupervisorComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    SupervisorRoutingModule,
    NgxPaginationModule,
    FilterPipeModule
  ]
})
export class SupervisorModule { }
