import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatExpansionPanel } from '@angular/material/expansion';
import { Subject, takeUntil } from 'rxjs';
import { EventLogAttributesFilter } from 'src/app/shared/event-log';
import { GroupTotalHoursType, ReportType } from 'src/app/shared/report';
import { ReportsService } from '../reports.service';
import { CrewManagerService } from 'src/app/crew-manager/crew-manager.service';

@Component({
  selector: 'app-total-hours-per-crew-manager',
  templateUrl: './total-hours-per-crew-manager.component.html',
  styleUrls: ['./total-hours-per-crew-manager.component.css']
})
export class TotalHoursPerCrewManagerComponent implements OnInit, OnDestroy {

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
    public crewManagerService: CrewManagerService
  ) { }

  ngOnInit(): void {
    this.reportsService.setProcessEventLogs = true;
    this.reportsService.report = ReportType.TotalHoursPerCrewManager;

    this.crewManagerService.refreshCrewManagers();

    this.reportsService.totalHoursPerGroup$
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(totalHoursPerGroup => {
        this.alreadySearched = true;
        this.totalHoursPerGroup = totalHoursPerGroup;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
    this.reportsService.setProcessEventLogs = false;
  }

  onCrewManagerFilteredBy(filterText: string | null) {
    this.crewManagerService.filter = filterText || '';
  }

  onCrewManagerLoadMoreItems(event: any) {
    this.crewManagerService.loadMoreCrewManagers();
  }

  onCrewManagerSelectedItem(item: any) {
    if (this.eventLogAttributesFilter) {
      this.eventLogAttributesFilter.crewManagerId = this.getItemId(item);
    } else {
      this.eventLogAttributesFilter = { crewManagerId: this.getItemId(item) };
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

  searchTotalHoursPerCrewManager() {
    this.handleDateRange();
    this.reportsService.generateReportTotalHoursPerGroup(this.eventLogAttributesFilter);
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
