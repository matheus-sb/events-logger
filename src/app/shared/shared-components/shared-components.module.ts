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



@NgModule({
  declarations: [
    ImageUploadComponent,
    AsyncAutocompleteComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    ReactiveFormsModule,
    AsyncPipe,
    ScrollingModule
  ],
  exports: [
    ImageUploadComponent,
    AsyncAutocompleteComponent
  ]
})
export class SharedComponentsModule { }
