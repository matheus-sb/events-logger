import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { MatButtonModule } from '@angular/material/button';
import { AsyncAutocompleteComponent } from './async-autocomplete/async-autocomplete.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';



@NgModule({
  declarations: [
    ImageUploadComponent,
    AsyncAutocompleteComponent,
    FileUploadComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatToolbarModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    ReactiveFormsModule,
    AsyncPipe,
    ScrollingModule
  ],
  exports: [
    ImageUploadComponent,
    AsyncAutocompleteComponent,
    FileUploadComponent
  ]
})
export class SharedComponentsModule { }
