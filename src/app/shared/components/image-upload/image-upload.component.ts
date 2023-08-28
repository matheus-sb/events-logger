import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { NotificationHandlerService } from 'src/app/services/notification-handler.service';

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

  constructor(private notificationHandlerService: NotificationHandlerService) {}

  onImageSelected(event: any) {
    const maxSizeKB = 250; // This max size is due to the fact that I am persisting it in local storage
    const file = event.target.files[0];
    if (file) {
      const fileSizeKB = file.size / 1024; // Convert to kilobytes
      
      if (fileSizeKB > maxSizeKB) {
        this.notificationHandlerService.handleNotification(`File size exceeds ${maxSizeKB}KB limit. Please select a smaller file.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage = e.target.result;
        this.imageSelected.emit(e.target.result); // Emit the selected image data
      };
      reader.readAsDataURL(file);
    }
  }
}
