import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserComponent } from './user.component';
import { UserRoutingModule } from './user-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserDetailComponent } from './user-detail/user-detail.component';
import { UserReportComponent } from './user-report/user-report.component';
import { UserIncidenceComponent } from './user-incidence/user-incidence.component';
import { NgxPaginationModule } from 'ngx-pagination';


@NgModule({
  declarations: [UserComponent, UserDetailComponent, UserReportComponent, UserIncidenceComponent],
  imports: [
    CommonModule, FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    NgxPaginationModule
  ]
})
export class UserModule { }
