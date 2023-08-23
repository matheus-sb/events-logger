import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RelationshipType, RelationshipsType, Worker, WorkerDialogData } from '../shared/worker';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, filter, map, of, pairwise, takeUntil, throttleTime } from 'rxjs';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatDialog } from '@angular/material/dialog';
import { WorkerService } from './worker.service';
import { ErrorHandlerService } from '../services/error-handler.service';
import { NotificationHandlerService } from '../services/notification-handler.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { CreateEditWorkerComponent } from './dialogs/create-edit-worker/create-edit-worker.component';
import { ConfirmationDialogData } from '../shared/confirmation-dialog-data';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CrewManagerService } from '../services/crew-manager.service';
import { Identifiable } from '../shared/identifiable';

@Component({
  selector: 'app-worker',
  templateUrl: './worker.component.html',
  styleUrls: ['./worker.component.css'],
  providers: [CrewManagerService]
})
export class WorkerComponent implements OnInit, OnDestroy, AfterViewInit {
  workers: Worker[] = [];
  isLoading = false;
  isHandset = true;

  private unsubscribe$ = new Subject<void>();
  private filterText$ = new Subject<string>();


  @ViewChild('scroller') scroller!: CdkVirtualScrollViewport;
  @ViewChild('filter') filterInput!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private workerService: WorkerService,
    private errorHandlerService: ErrorHandlerService,
    private ngZone: NgZone,
    private notificationHandlerService: NotificationHandlerService,
    private breakpointObserver: BreakpointObserver,
    private crewManagerService: CrewManagerService,
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
        this.workerService.loadMoreWorkers();
      });
    }
    );
  }

  ngOnInit() {
    this.workerService.refreshWorkers(); // Initialize and load workers when the component is accessed

    this.workerService.workers$
      .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when the component is destroyed
      .subscribe(workers => {
        this.isLoading = false;
        this.workers = workers; // Update the component's workers array when workers change
      });

    this.filterText$.pipe(
      takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((filterText) => {
      this.workerService.filter = filterText;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  filterWorkers(filterText: string) {
    this.filterText$.next(filterText);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  resetFilterInput() {
    this.filterInput.nativeElement.value = '';
  }

  // Get all worker relationships to be used in asyc-autocomplete
  getRelationships(worker: Worker|null): Observable<RelationshipsType | undefined> {
    const isEditing = !!worker;

    if (!isEditing) {
      this.crewManagerService.filter = '';
      return of(null);
    }

    return this.crewManagerService.getCrewManagerById(worker.crewManagerId).pipe(
      map(crewManager => {
        if (crewManager) {
          this.crewManagerService.filter = crewManager.name;
          return {crewManager}
        } else {
          this.crewManagerService.filter = '';
          return;
        }
      })
    );
  }

  onCreateOrEditWorker(worker: Worker | null = null): void {
    const isEditing = !!worker;
    const dialogTitle = isEditing ? 'Edit worker' : 'Create worker';

    this.getRelationships(worker).subscribe((relationships) => {
      const dialogRef = this.dialog.open(CreateEditWorkerComponent, {
        width: '600px',
        data: { title: dialogTitle, worker, crewManagerService: this.crewManagerService, relationships } as WorkerDialogData
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const worker$: Observable<Worker> = isEditing ?
            this.workerService.updateWorker({ ...result }) :
            this.workerService.createWorker({ ...result });
  
          worker$.pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError(`Failed to ${isEditing ? 'edit' : 'create'} worker. Please try again later.`);
            })
          ).subscribe(() => {
            this.notificationHandlerService.handleNotification(`Worker successfully ${isEditing ? 'edited' : 'created'}!`);
            this.resetFilterInput();
            this.workerService.refreshWorkers();
          });
        }
      });

    });
  }

  onDeleteWorker(worker: Worker) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { title: "Delete worker", content: `Are you sure that you want to delete ${worker.name}?` } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.workerService.deleteWorker(worker.id)
          .pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError('Failed to delete worker. Please try again later.');
            })
          )
          .subscribe(() => {
            this.notificationHandlerService.handleNotification('Worker successfully deleted!');
            this.resetFilterInput();
            this.workerService.refreshWorkers();
          });
      }
    });
  }
}
