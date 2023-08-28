import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileInfo } from '../../file-info';
import { NotificationHandlerService } from 'src/app/services/notification-handler.service';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.css']
})
export class FileUploadComponent {
  currentFile?: File;
  fileName = 'Select File';

  @Input() filesInfo: FileInfo[] = [];
  @Output() filesInfoChange: EventEmitter<FileInfo[]> = new EventEmitter<FileInfo[]>

  constructor(private notificationHandlerService: NotificationHandlerService) {}


  selectFile(event: any): void {
    if (event.target.files && event.target.files[0]) {
      const maxSizeKB = 250; // This max size is due to the fact that I am persisting it in local storage
      const file: File = event.target.files[0];
      const fileSizeKB = file.size / 1024; // Convert to kilobytes
      
      if (fileSizeKB > maxSizeKB) {
        this.notificationHandlerService.handleNotification(`File size exceeds ${maxSizeKB}KB limit. Please select a smaller file.`);
        return;
      }

      this.currentFile = file;
      this.fileName = this.currentFile.name;
    } else {
      this.fileName = 'Select File';
    }
  }

  upload(): void {
    if (!this.currentFile) {
      return;
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      const newFilesInfo = [...this.filesInfo, {fileName: this.currentFile?.name, fileData: fileContent} as FileInfo];
      
      this.filesInfoChange.emit(newFilesInfo);
      // Clear the uploaded file after processing
      this.currentFile = undefined;
      this.fileName = 'Select File';
    };
    reader.readAsDataURL(this.currentFile);
  }

  downloadFile(fileInfo: FileInfo): void {
    if (!fileInfo) {
      return;
    }
    
    // Create a Blob from the Data URL
    const blob = this.dataURItoBlob(fileInfo.fileData);

    // Create a temporary URL for the Blob
    const url = window.URL.createObjectURL(blob);

    // Create an anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileInfo.fileName;
    a.style.display = 'none';

    // Trigger a click event to start the download
    document.body.appendChild(a);
    a.click();

    // Clean up resources
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }

  private dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], { type: mimeString });
  }

  deleteFile(index: number) {
    const newFilesInfo = [...this.filesInfo];
    newFilesInfo.splice(index, 1);
    this.filesInfoChange.emit(newFilesInfo);
  }

}
