import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageUploadComponent } from './image-upload/image-upload.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    ImageUploadComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [
    ImageUploadComponent
  ]
})
export class SharedComponentsModule { }
