import { Component } from '@angular/core';
import { ActivatedRoute, IsActiveMatchOptions, Router } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent {

  constructor(private router: Router, private route: ActivatedRoute) {}
  
  isRouteActive(route: string): boolean {
    const options: IsActiveMatchOptions = {
      paths: 'subset',
      matrixParams: 'ignored',
      queryParams: 'ignored',
      fragment: 'ignored'
    };
    return this.router.isActive(route, options);
  }
}
