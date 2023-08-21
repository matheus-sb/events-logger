import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  handleNotification(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
    });
  }
}
