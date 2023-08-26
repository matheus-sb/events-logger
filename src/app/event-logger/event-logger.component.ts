import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, filter, forkJoin, map, of, pairwise, takeUntil, throttleTime } from 'rxjs';
import { ErrorHandlerService } from '../services/error-handler.service';
import { EventLog, EventLogAttributesFilter, EventLogFilterType, EventLogSortOrderType, EventLoggerDialogData, EventLoggerRelationshipsType } from '../shared/event-log';
import { EventLoggerService } from './event-logger.service';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { NotificationHandlerService } from '../services/notification-handler.service';
import { CrewManagerService } from '../services/crew-manager.service';
import { CreateEditEventLoggerComponent } from './dialogs/create-edit-event-logger/create-edit-event-logger.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../shared/confirmation-dialog-data';
import { ProjectService } from '../project/project.service';
import { WorkerService } from '../worker/worker.service';
import { Project } from '../shared/project';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-event-logger',
  templateUrl: './event-logger.component.html',
  styleUrls: ['./event-logger.component.css'],
  providers: [ProjectService, CrewManagerService, WorkerService, DatePipe]
})
export class EventLoggerComponent implements OnInit, OnDestroy, AfterViewInit {
  eventLogs: EventLog[] = [];
  isLoading = false;
  isHandset = true;

  private unsubscribe$ = new Subject<void>();
  private filterText$ = new Subject<string>();
  private filterByAttributes$ = new Subject<EventLogAttributesFilter|undefined>();

  @ViewChild('scroller') scroller!: CdkVirtualScrollViewport;

  constructor(
    private dialog: MatDialog,
    private eventLogService: EventLoggerService,
    private errorHandlerService: ErrorHandlerService,
    private ngZone: NgZone,
    private notificationHandlerService: NotificationHandlerService,
    private breakpointObserver: BreakpointObserver,
    private projectService: ProjectService,
    private crewManagerService: CrewManagerService,
    private workerService: WorkerService,
    private datePipe: DatePipe
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
      filter(([y1, y2]) => (y2 < y1 && y2 < 188)),
      throttleTime(200)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.eventLogService.loadMoreEventLogs();
      });
    }
    );
  }

  ngOnInit() {
    this.eventLogService.refreshEventLogs(); // Initialize and load eventLogs when the component is accessed

    this.eventLogService.eventLogs$
      .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when the component is destroyed
      .subscribe(eventLogs => {
        this.isLoading = false;
        this.eventLogs = eventLogs; // Update the component's eventLogs array when eventLogs change
      });

    this.filterText$.pipe(
      takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((filterText) => {
      this.eventLogService.filter = filterText;
    });

    this.filterByAttributes$.pipe(
      takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
    ).subscribe((attributesFilter) => {
      this.eventLogService.filter = attributesFilter;
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  filterEventLogs(filterText: string) {
    this.filterText$.next(filterText);
  }

  filterEventLogsByAttributes(attributesFilter: EventLogAttributesFilter|undefined) {
    this.filterByAttributes$.next(attributesFilter);
  }

  onOpenedStep(filterType: EventLogFilterType) {
    this.eventLogService.setFilterAndSortOrderTypes(filterType, EventLogSortOrderType.Reversed);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  // Get all eventLog relationships to be used in asyc-autocomplete
  getRelationships(eventLog: EventLog|null): Observable<EventLoggerRelationshipsType | undefined> {
    const isEditing = !!eventLog;

    if (!isEditing) {
      this.projectService.filter = '';
      this.crewManagerService.filter = '';
      this.workerService.filter = '';
      return of(null);
    }

    const project$ = this.projectService.getProjectById(eventLog.projectId);
    const crewManager$ = this.crewManagerService.getCrewManagerById(eventLog.crewManagerId)
    const worker$ = this.workerService.getWorkerById(eventLog.workerId)
    
    return forkJoin([project$, crewManager$, worker$]).pipe(
      map(results => {
        const relationships: EventLoggerRelationshipsType = {
          project: results[0],
          crewManager: results[1],
          worker: results[2]
        }

        // Filter based on the found project, crewManager, and worker
        this.projectService.filter = results[0] ? results[0].name : '';
        this.crewManagerService.filter = results[1] ? results[1].name : '';
        this.workerService.filter = results[2] ? results[2].name : '';

        return relationships;
      })
    );
  }

  onCreateOrEditEventLog(eventLog: EventLog | null = null): void {
    const isEditing = !!eventLog;
    const dialogTitle = isEditing ? 'Edit event log' : 'Create event log';

    this.getRelationships(eventLog).subscribe((relationships) => {
      const dialogRef = this.dialog.open(CreateEditEventLoggerComponent, {
        width: '600px',
        data: { 
          title: dialogTitle, 
          eventLog,
          projectService: this.projectService, 
          crewManagerService: this.crewManagerService,
          workerService: this.workerService, 
          relationships 
        } as EventLoggerDialogData
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          const eventLog$: Observable<EventLog> = isEditing ?
            this.eventLogService.updateEventLog({ ...result }) :
            this.eventLogService.createEventLog({ ...result, date: this.datePipe.transform(new Date(), 'yyyy-MM-ddTHH:mm') });
  
          eventLog$.pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError(`Failed to ${isEditing ? 'edit' : 'create'} event log. Please try again later.`);
            })
          ).subscribe(() => {
            this.notificationHandlerService.handleNotification(`Event log successfully ${isEditing ? 'edited' : 'created'}!`);
            this.eventLogService.refreshEventLogs();
          });
        }
      });

    });
  }

  onDeleteEventLog(eventLog: EventLog) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { title: "Delete event log", content: `Are you sure that you want to delete ${eventLog.id}?` } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.eventLogService.deleteEventLog(eventLog.id)
          .pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError('Failed to delete event log. Please try again later.');
            })
          )
          .subscribe(() => {
            this.notificationHandlerService.handleNotification('Event log successfully deleted!');
            this.eventLogService.refreshEventLogs();
          });
      }
    });
  }
}

