import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkerComponent } from './worker.component';
import { CreateEditWorkerComponent } from './dialogs/create-edit-worker/create-edit-worker.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { SharedComponentsModule } from '../shared/shared-components/shared-components.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import {MatAutocompleteModule} from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    WorkerComponent,
    CreateEditWorkerComponent
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    ScrollingModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatCardModule,
    SharedComponentsModule,
    MatTooltipModule,
    MatAutocompleteModule
  ]
})
export class WorkerModule { }
