import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, first, forkJoin, map, throwError } from 'rxjs';
import { EventLog, EventLogAttributesFilter, EventLogFilterType, EventLogSortOrderType } from '../shared/event-log';
import { CrudService } from '../services/crud.service';
import { ProjectService } from '../project/project.service';
import { Project } from '../shared/project';
import { CrewManager } from '../shared/crew-manager';
import { CrewManagerService } from '../crew-manager/crew-manager.service';
import { WorkerService } from '../worker/worker.service';
import { Worker } from '../shared/worker';

function isEventLogAttributesFilter(obj: any): obj is EventLogAttributesFilter {
  return obj !== null && typeof obj !== 'string';
}


@Injectable({
  providedIn: 'root'
})
export class EventLoggerService {
  private table = 'event-logs';
  private skippedItems = 0;
  private batchSize = 15;
  private filterType: EventLogFilterType = EventLogFilterType.CompleteTextSearch;
  private sortOrderType: EventLogSortOrderType = EventLogSortOrderType.Reversed;
  public eventLogsSubject = new BehaviorSubject<EventLog[]>([]);
  public filterSubject = new BehaviorSubject<string|EventLogAttributesFilter|null|undefined>(null);

  eventLogs$: Observable<EventLog[]> = this.eventLogsSubject.asObservable();

  constructor(private crudService: CrudService,
    private projectService: ProjectService,
    private crewManagerService: CrewManagerService,
    private workerService: WorkerService
  ) {
    this.filterSubject.subscribe((filterText) => {
      if (filterText !== null) {
        this.skippedItems = 0;
        this.loadMoreEventLogs();
      }
    });
  }

  get filter(): string|EventLogAttributesFilter|null|undefined {
    return this.filterSubject.value;
  }

  set filter(filterText: string | EventLogAttributesFilter|undefined) {
    this.filterSubject.next(filterText);
  }

  setFilterAndSortOrderTypes(filterType: EventLogFilterType, sortOrderType: EventLogSortOrderType) {
    if (this.filterType != filterType || this.sortOrderType != sortOrderType) {
      this.filterType = filterType;
      this.sortOrderType = sortOrderType;
      this.skippedItems = 0;
    }
  }

  createEventLog(eventLog: EventLog) {
    return this.crudService.create(this.table, eventLog).pipe(
      catchError((error) => {
        console.error('Error creating event log:', error);
        return throwError(() => new Error('Failed to create event log. Please try again later.'));
      })
    );
  }

  getAllEventLogs() {
    return this.crudService.getAll(this.table).pipe(
      catchError((error) => {
        console.error('Error fetching event logs:', error);
        return throwError(() => new Error('Failed to fetch event logs. Please try again later.'));
      })
    );
  }

  updateEventLog(updatedEventLog: EventLog) {
    return this.crudService.update(this.table, updatedEventLog).pipe(
      catchError((error) => {
        console.error('Error updating event log:', error);
        return throwError(() => new Error('Failed to update event log. Please try again later.'));
      })
    );
  }

  deleteEventLog(id: number) {
    return this.crudService.delete(this.table, id).pipe(
      catchError((error) => {
        console.error('Error deleting event log:', error);
        return throwError(() => new Error('Failed to delete event log. Please try again later.'));
      })
    );
  }

  loadMoreEventLogs(): void {
    this.getRelationships()
      .pipe(first())
      .subscribe(([projects, crewManagers, workers]) => {
        const filterAndSortFuction = (data: EventLog[]) => this.filterAndSortEventLogs(data, projects as Project[], crewManagers as CrewManager[], workers as Worker[])

        this.crudService.getRange<EventLog>(this.table, this.skippedItems, this.batchSize, filterAndSortFuction)
          .subscribe({
            next: newEventLogs => {
              const currentEventLogs = this.eventLogsSubject.getValue();

              if (this.skippedItems === 0) { // It's the top of the list
                this.skippedItems += this.batchSize;
                this.eventLogsSubject.next(newEventLogs);
              } else if (newEventLogs.length === 0) { // if there are no more event logs send the current ones
                this.eventLogsSubject.next(currentEventLogs);
              } else {
                this.skippedItems += this.batchSize;
                this.eventLogsSubject.next([...currentEventLogs, ...newEventLogs]);
              }
            },
            error: error => {
              console.error(error);
            }
          });
      });
  }

  // Get all eventLogs relationships
  private getRelationships() {

    const project$ = this.projectService.getAllProjects();
    const crewManager$ = this.crewManagerService.getAllCrewManagers()
    const worker$ = this.workerService.getAllWorkers();

    return forkJoin([project$, crewManager$, worker$]);
  }

  // Set projectName, crewManagerName, workerName to the eventLogs
  private setRelationships(eventLogs: EventLog[], projects: Project[],
    crewManagers: CrewManager[], workers: Worker[]
  ): EventLog[] {
    const projectDictionary = new Map();
    const crewManagerDictionary = new Map();
    const workerDictionary = new Map();

    projects.forEach(project => {
      projectDictionary.set(project.id, project.name);
    });

    crewManagers.forEach(crewManager => {
      crewManagerDictionary.set(crewManager.id, crewManager.name);
    });

    workers.forEach(worker => {
      workerDictionary.set(worker.id, worker.name);
    });

    return eventLogs.slice().map(eventLog => {
      return {
        ...eventLog,
        projectName: projectDictionary.get(eventLog.projectId),
        crewManagerName: crewManagerDictionary.get(eventLog.crewManagerId),
        workerName: workerDictionary.get(eventLog.workerId)
      }
    });
  }

  private filterCompleteTextSearch(eventLogs: EventLog[]): EventLog[] {
    return eventLogs.slice().filter((eventLog) => {
      const searchStr =
        `${eventLog.projectName}${eventLog.crewManagerName}${eventLog.workerName}`.toLowerCase();

      if (isEventLogAttributesFilter(this.filter)) {
        throw new Error("Filter is not from the type string");
      }

      return this.filter == null || searchStr.indexOf(this.filter.toLowerCase()) !== -1;
    });
  }

  private filterByAttributes(eventLogs: EventLog[]): EventLog[] {
    if (this.filter == null) {
      return eventLogs.slice();
    }

    // Added time to dateTo filter until the last second of the day
    let dateTo: Date | null = null;
    if (isEventLogAttributesFilter(this.filter) && !!this.filter.dateTo) {
      dateTo = new Date(this.filter.dateTo);
      dateTo.setHours(23, 59, 59);
    }

    return eventLogs.slice().filter((eventLog) => {
      if (!isEventLogAttributesFilter(this.filter)) {
        throw new Error("Filter is not from the type EventLogAttributesFilter ");
      }

      const matchedDate = !!this.filter.dateFrom && !!this.filter.dateTo
        ? new Date(eventLog.date) >= this.filter.dateFrom && new Date(eventLog.date) <= dateTo!
        : true;

      const matchedProject = !!this.filter.projectId
        ? eventLog.projectId === this.filter.projectId
        : true;

      const matchedCrewManager = !!this.filter.crewManagerId
        ? eventLog.crewManagerId === this.filter.crewManagerId
        : true;

      const matchedWorker = !!this.filter.workerId
        ? eventLog.workerId === this.filter.workerId
        : true;

      const matchedHasFiles = !!this.filter.hasFiles
        ? Array.isArray(eventLog.filesInfo) && eventLog.filesInfo.length
        : true

      return matchedDate && matchedProject && matchedCrewManager && matchedWorker && matchedHasFiles;
    });
  }

  private filterEventLogs(eventLogs: EventLog[], projects: Project[],
    crewManagers: CrewManager[], workers: Worker[]
  ): EventLog[] {
    switch (this.filterType) {
      case EventLogFilterType.CompleteTextSearch:
        const eventLogsWithRelationships = this.setRelationships(eventLogs, projects, crewManagers, workers);
        return this.filterCompleteTextSearch(eventLogsWithRelationships);

      case EventLogFilterType.ByAttributes:
        const filteredEventLogs = this.filterByAttributes(eventLogs);
        return this.setRelationships(filteredEventLogs, projects, crewManagers, workers);

      default:
        return eventLogs;
    }
  }

  private sortCrewManagers(eventLogs: EventLog[]): EventLog[] {
    switch (this.sortOrderType) {
      case EventLogSortOrderType.Reversed:
        return eventLogs.slice().reverse();
      // case EventLogSortOrderType.AscendingByProjectName:
      //   return eventLogs.slice().sort((a, b) => a.projectName < b.projectName ? -1 : a.projectName > b.projectName ? 1 : 0);
      default:
        return eventLogs;
    }
  }

  private filterAndSortEventLogs(data: EventLog[], projects: Project[],
    crewManagers: CrewManager[], workers: Worker[]
  ): EventLog[] {
    const newData = this.filterEventLogs(data, projects, crewManagers, workers);
    return this.sortCrewManagers(newData);
  }

  // Reset the eventLog list
  refreshEventLogs(): void {
    this.skippedItems = 0;
    this.filterSubject.next(null);
    this.loadMoreEventLogs();
  }
}
