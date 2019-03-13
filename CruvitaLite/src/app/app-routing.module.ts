import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ResultsComponent } from './results/results.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'results',
    component: ResultsComponent,
  }
];
// ?location&myhome&tab&NELAT&NELONG&SWLAT&SWLONG&zoom&anchor&edLevel&score&updatedDate
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
