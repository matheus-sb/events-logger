import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CrewManagerComponent } from './crew-manager.component';
import { CreateEditCrewManagerComponent } from './dialogs/create-edit-crew-manager/create-edit-crew-manager.component';
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
import {MatTooltipModule} from '@angular/material/tooltip';
import { SharedComponentsModule } from '../shared/components/shared-components.module';

@NgModule({
  declarations: [
    CrewManagerComponent,
    CreateEditCrewManagerComponent
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
    MatTooltipModule
  ]
})
export class CrewManagerModule { }
