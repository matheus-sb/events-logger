import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, filter, map, pairwise, takeUntil, throttleTime } from 'rxjs';
import { CrewManager, CrewManagerDialogData } from '../shared/crew-manager';
import { MatDialog } from '@angular/material/dialog';
import { CrewManagerService } from '../services/crew-manager.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { NotificationHandlerService } from '../services/notification-handler.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../shared/confirmation-dialog-data';
import { CreateEditCrewManagerComponent } from './dialogs/create-edit-crew-manager/create-edit-crew-manager.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-crew-manager',
  templateUrl: './crew-manager.component.html',
  styleUrls: ['./crew-manager.component.css']
})
 export class CrewManagerComponent implements OnInit, OnDestroy, AfterViewInit {
  crewManagers: CrewManager[] = [];
  isLoading = false;
  isHandset = true;

  private unsubscribe$ = new Subject<void>();
  private filterText$ = new Subject<string>();
  

  @ViewChild('scroller') scroller!: CdkVirtualScrollViewport;
  @ViewChild('filter') filterInput!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private crewManagerService: CrewManagerService,
    private errorHandlerService: ErrorHandlerService,
    private ngZone: NgZone,
    private notificationHandlerService: NotificationHandlerService,
    private breakpointObserver: BreakpointObserver
  ) { 
    // Detect mobile breakpoint and adjust dialog width
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe(result => {
        this.isHandset = result.matches;
      });
  }

  ngAfterViewInit(): void {
    this.scroller.elementScrolled().pipe(
      map(() => this.scroller.measureScrollOffset('bottom')),
      pairwise(),
      filter(([y1, y2]) => (y2 < y1 && y2 < 140)),
      throttleTime(200)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.crewManagerService.loadMoreCrewManagers();
      });
    }
    );
  }

  ngOnInit() {
    this.crewManagerService.refreshCrewManagers(); // Initialize and load crewManagers when the component is accessed

    this.crewManagerService.crewManagers$
      .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when the component is destroyed
      .subscribe(crewManagers => {
        this.isLoading = false;
        this.crewManagers = crewManagers; // Update the component's crewManagers array when crewManagers change
      });

      this.filterText$.pipe(
        takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe((filterText) => {
        this.crewManagerService.filter = filterText;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  filterCrewManagers(filterText: string) {
    this.filterText$.next(filterText);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  resetFilterInput() {
    this.filterInput.nativeElement.value = '';
  }

  onCreateOrEditCrewManager(crewManager: CrewManager | null = null): void {
    const isEditing = !!crewManager;
    const dialogTitle = isEditing ? 'Edit crew manager' : 'Create crew manager';

    const dialogRef = this.dialog.open(CreateEditCrewManagerComponent, {
      width: '600px',
      data: { title: dialogTitle, crewManager } as CrewManagerDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const crewManager$: Observable<CrewManager> = isEditing ?
          this.crewManagerService.updateCrewManager({ ...result }) :
          this.crewManagerService.createCrewManager({ ...result });

          crewManager$.pipe(
          catchError((error) => {
            return this.errorHandlerService.handleError(`Failed to ${isEditing ? 'edit' : 'create'} crew manager. Please try again later.`);
          })
        ).subscribe(() => {
          this.notificationHandlerService.handleNotification(`Crew manager successfully ${isEditing ? 'edited' : 'created'}!`);
          this.resetFilterInput();
          this.crewManagerService.refreshCrewManagers();
        });
      }
    });
  }

  onDeleteCrewManager(crewManager: CrewManager) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { title: "Delete crew manager", content: `Are you sure that you want to delete ${crewManager.name}?` } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.crewManagerService.deleteCrewManager(crewManager.id)
          .pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError('Failed to delete crew manager. Please try again later.');
            })
          )
          .subscribe(() => {
            this.notificationHandlerService.handleNotification('Crew manager successfully deleted!');
            this.resetFilterInput();
            this.crewManagerService.refreshCrewManagers();
          });
      }
    });
  } 
}
