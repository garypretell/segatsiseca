import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home.component';
import { HomeRoutingModule } from './home-routing.module';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterPipeModule } from 'ngx-filter-pipe';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    HomeRoutingModule,
    FilterPipeModule
  ]
})
export class HomeModule { }
