import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFoundComponent } from '../shared/components/page-not-found/page-not-found.component';
import { SupervisorComponent } from './supervisor.component';



const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', component: SupervisorComponent, pathMatch: 'full' }
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
export class SupervisorRoutingModule {}
