import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReportsService } from '../reports.service';
import { ProjectService } from 'src/app/project/project.service';
import { EventLogAttributesFilter } from 'src/app/shared/event-log';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { GroupTotalHoursType, ReportType } from 'src/app/shared/report';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-total-hours-per-project',
  templateUrl: './total-hours-per-project.component.html',
  styleUrls: ['./total-hours-per-project.component.css'],
  providers: []
})
export class TotalHoursPerProjectComponent implements OnInit, OnDestroy {

  private eventLogAttributesFilter?: EventLogAttributesFilter;

  totalHoursPerGroup:GroupTotalHoursType[] = [];
  alreadySearched = false;
  dateRange = new FormGroup(
    {
      start: new FormControl<Date | null>(null),
      end: new FormControl<Date | null>(null),
    },
    { validators: this.dateRangeValidator }
  );

  private unsubscribe$ = new Subject<void>();

  @ViewChild('expansionPanel') expansionPanel!: MatExpansionPanel;

  constructor(
    private reportsService: ReportsService,
    public projectService: ProjectService
  ) { }

  ngOnInit(): void {
    this.reportsService.report = ReportType.TotalHoursPerProject;

    this.projectService.refreshProjects();

    this.reportsService.totalHoursPerGroup$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(totalHoursPerGroup => {
        this.alreadySearched = true;
        this.totalHoursPerGroup = totalHoursPerGroup;
      })
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  onProjectFilteredBy(filterText: string | null) {
    this.projectService.filter = filterText || '';
  }

  onProjectLoadMoreItems(event: any) {
    this.projectService.loadMoreProjects();
  }

  onProjectSelectedItem(item: any) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.projectId = this.getItemId(item);
    } else {
      this.eventLogAttributesFilter = { projectId: this.getItemId(item) };
    }
  }

  private getItemId(item: any) {
    return item ? item.id : null;
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

  searchTotalHoursPerProject() {
    this.handleDateRange();
    this.reportsService.generateTotalHoursPerProject(this.eventLogAttributesFilter);
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

  getFormattedTime(time: number) {
    return this.reportsService.convertToTime(time);
  }
}
