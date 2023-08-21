import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'events-logger';
  isHandset = true;

  constructor(private breakpointObserver: BreakpointObserver) {
  // Detect mobile breakpoint and adjust dialog width
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }
}
