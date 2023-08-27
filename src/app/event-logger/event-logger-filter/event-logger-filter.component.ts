import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { ProjectService } from 'src/app/project/project.service';
import { CrewManagerService } from 'src/app/services/crew-manager.service';
import { EventLogAttributesFilter, EventLogFilterType } from 'src/app/shared/event-log';
import { WorkerService } from 'src/app/worker/worker.service';

@Component({
  selector: 'app-event-logger-filter',
  templateUrl: './event-logger-filter.component.html',
  styleUrls: ['./event-logger-filter.component.css'],
  providers: [ProjectService, CrewManagerService, WorkerService]
})
export class EventLoggerFilterComponent implements OnInit {
  private eventLogAttributesFilter?: EventLogAttributesFilter;

  dateRange = new FormGroup(
    {
      start: new FormControl<Date | null>(null),
      end: new FormControl<Date | null>(null),
    },
    { validators: this.dateRangeValidator }
  );

  @ViewChild('expansionPanel') expansionPanel!: MatExpansionPanel;

  @Output() filteredByTextSearch: EventEmitter<string> = new EventEmitter<string>();
  @Output() filteredByAttributes: EventEmitter<EventLogAttributesFilter | undefined> = new EventEmitter<EventLogAttributesFilter | undefined>();
  @Output() openedStep: EventEmitter<EventLogFilterType> = new EventEmitter<EventLogFilterType>();

  constructor(
    public projectService: ProjectService,
    public crewManagerService: CrewManagerService,
    public workerService: WorkerService
  ) { }

  ngOnInit() {
    this.projectService.refreshProjects();
    this.crewManagerService.refreshCrewManagers();
    this.workerService.refreshWorkers();
  }

  filterEventLogsByTextSearch(filterText: string) {
    this.filteredByTextSearch.emit(filterText);
  }

  filterEventLogsByAttributes() {
    this.handleDateRange();
    this.filteredByAttributes.emit(this.eventLogAttributesFilter);
    this.expansionPanel.close();
  }

  private handleDateRange() {
    const dateRangeValue = this.dateRange.getRawValue();

    // to avoid set date rage when it was not touched
    if (!dateRangeValue.start && !dateRangeValue.end && !this.eventLogAttributesFilter) {
      return;
    }

    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.dateFrom = dateRangeValue.start;
      this.eventLogAttributesFilter.dateTo = dateRangeValue.end;
    } else {
      this.eventLogAttributesFilter = { dateFrom: dateRangeValue.start, dateTo: dateRangeValue.end };
    }
  }

  dateRangeValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const startDate = control.get('start')!.value;
    const endDate = control.get('end')!.value;

    if (!startDate && !endDate) {
      return null; // Both dates are null, no validation error
    }

    if (!startDate || !endDate) {
      return { incompleteRange: true }; // One date is selected, validation error
    }

    return null; // Valid range
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private setFilter(service: any, filterText: string | null) {
    service.filter = filterText || '';
  }

  onOpenedStep(filterType: EventLogFilterType) {
    this.openedStep.emit(filterType);
  }

  onProjectFilteredBy(filterText: string | null) {
    this.setFilter(this.projectService, filterText);
  }

  onCrewManagerFilteredBy(filterText: string | null) {
    this.setFilter(this.crewManagerService, filterText);
  }

  onWorkerFilteredBy(filterText: string | null) {
    this.setFilter(this.workerService, filterText);
  }

  onProjectLoadMoreItems(event: any) {
    this.projectService.loadMoreProjects();
  }

  onCrewManagerLoadMoreItems(event: any) {
    this.crewManagerService.loadMoreCrewManagers();
  }

  onWorkerLoadMoreItems(event: any) {
    this.workerService.loadMoreWorkers();
  }

  onProjectSelectedItem(item: any) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.projectId = this.getItemId(item);
    } else {
      this.eventLogAttributesFilter = { projectId: this.getItemId(item) };
    }
  }

  onCrewManagerSelectedItem(item: any) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.crewManagerId = this.getItemId(item);
    } else {
      this.eventLogAttributesFilter = { crewManagerId: this.getItemId(item) };
    }
  }

  onWorkerSelectedItem(item: any) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.workerId = this.getItemId(item);
    } else {
      this.eventLogAttributesFilter = { workerId: this.getItemId(item) };
    }
  }

  private getItemId(item: any) {
    return item ? item.id : null;
  }

  setHasFiles(hasFiles: boolean) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.hasFiles = hasFiles;
    } else {
      this.eventLogAttributesFilter = { hasFiles: hasFiles };
    }
  }

}
