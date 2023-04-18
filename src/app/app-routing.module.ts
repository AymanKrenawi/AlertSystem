import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TableComponent } from './table/table.component';

const routes: Routes = [
  { path: 'table-component', component: TableComponent },
 // { path: 'second-component', component: SecondComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes),CommonModule],
  exports: [RouterModule],
  
})
export class AppRoutingModule { }

export class MyComponentModule { }
