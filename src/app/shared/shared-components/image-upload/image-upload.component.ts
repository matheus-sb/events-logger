import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Input()
  get selectedImage(): string | null { return this._selectedImage; }
  set selectedImage(selectedImage: string) {
    this._selectedImage = selectedImage;
  }

  @Output() imageSelected: EventEmitter<string> = new EventEmitter<string>();

  private _selectedImage: string | null = null;

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.imageSelected.emit(e.target.result); // Emit the selected image data
      };
      reader.readAsDataURL(file);
    }
  }
}
