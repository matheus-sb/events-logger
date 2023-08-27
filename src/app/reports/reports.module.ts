import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TotalHoursPerProjectComponent } from './total-hours-per-project/total-hours-per-project.component';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { ReportsService } from './reports.service';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { SharedComponentsModule } from '../shared/shared-components/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [
    TotalHoursPerProjectComponent
  ],
  imports: [
    CommonModule,
    MatListModule,
    MatDividerModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    MatInputModule,
    SharedComponentsModule,
    MatButtonModule,
    MatToolbarModule,
    MatCardModule,
  ]
})
export class ReportsModule { }
