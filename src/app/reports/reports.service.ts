import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { EventLoggerService } from '../event-logger/event-logger.service';
import { EventLog, EventLogAttributesFilter, EventLogFilterType, EventLogSortOrderType, EventType } from '../shared/event-log';
import { GroupAttributes, GroupTotalHoursType, RawEventAndDateTypePerSubGroupIdAndDate, RawTotalHoursPerGroupType, ReportType, SubGroupTotalHoursType, SubgroupPerDateType } from '../shared/report';



@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  private totalHoursPerGroupSubject = new Subject<GroupTotalHoursType[]>();
  private reportType: ReportType = ReportType.TotalHoursPerProject;

  totalHoursPerGroup$: Observable<GroupTotalHoursType[]> = this.totalHoursPerGroupSubject.asObservable();

  constructor(private eventLoggerService: EventLoggerService) {
    eventLoggerService.setFilterAndSortOrderTypes(EventLogFilterType.ByAttributes, EventLogSortOrderType.Reversed);
    
    this.eventLoggerService.eventLogs$.subscribe((eventLogs) => {
      const rawTotalHoursPerGroup = eventLogs.reduce<RawTotalHoursPerGroupType>((rawTotalHoursPerGroupAcc, eventLog) => {
        const group = this.getGroupIdAttr();

        // If the group was not added skip this event log (e.g. worker is not mandatory)
        if (!eventLog[group.idAttr]) {
          return rawTotalHoursPerGroupAcc;
        }

        if (!rawTotalHoursPerGroupAcc[eventLog[group.idAttr]]) {
          rawTotalHoursPerGroupAcc[eventLog[group.idAttr]] = { name: eventLog[group.nameAttr]! };
        }

        const rawGroup = rawTotalHoursPerGroupAcc[eventLog[group.idAttr]];

        if (this.reportType === ReportType.TotalHoursPerProject) {
          if (eventLog.workerId) {
            rawGroup.workers = this.processSubgroup(rawGroup.workers, eventLog, eventLog.workerId, eventLog.workerName!);
          } else { // crewManager
            rawGroup.crewManagers = this.processSubgroup(rawGroup.crewManagers, eventLog, eventLog.crewManagerId, eventLog.crewManagerName!);
          }
        } else { // TotalHoursPerCrewManager and TotalHoursPerWorker
          rawGroup.projects = this.processSubgroup(rawGroup.projects, eventLog, eventLog.projectId, eventLog.projectName!);
        }

        return rawTotalHoursPerGroupAcc;
      }, {});

      const totalHoursPerGroup = this.generateTotalHoursPerGroup(rawTotalHoursPerGroup);

      this.totalHoursPerGroupSubject.next(totalHoursPerGroup);

      console.log('rawTotalHoursPerGroup', rawTotalHoursPerGroup);
      console.log('totalHoursPerGroup', totalHoursPerGroup);
    })
  }

  set report(reportType: ReportType) {
    this.reportType = reportType;
  }

  getGroupIdAttr(): GroupAttributes {
    switch (this.reportType) {
      case ReportType.TotalHoursPerProject:
        return { idAttr: 'projectId', nameAttr: 'projectName' };
      case ReportType.TotalHoursPerCrewManager:
        return { idAttr: 'crewManagerId', nameAttr: 'crewManagerName' };
      case ReportType.TotalHoursPerWorker:
        return {idAttr: 'workerId', nameAttr: 'workerName' };
      default:
        throw new Error('Report type not implement yet');
    }
  }

  processSubgroup(
    projectSubgroups: RawEventAndDateTypePerSubGroupIdAndDate | undefined,
    eventLog: EventLog,
    subgroupId: number,
    subgroupNameOrDescription: string
  ) {
    const subgroups = projectSubgroups || {};

    if (!subgroups[subgroupId]) {
      subgroups[subgroupId] = { name: subgroupNameOrDescription };
    }

    const subgroup = subgroups[subgroupId];

    const dateString = eventLog.date.toString().split("T")[0];

    if (!subgroup[dateString]) {
      subgroup[dateString] = {};
    }

    const eventDate = subgroup[dateString] as SubgroupPerDateType

    eventDate[eventLog.eventType] = new Date(eventLog.date);

    return subgroups;
  }

  generateTotalHoursPerSubgroup(rawSubgroups: RawEventAndDateTypePerSubGroupIdAndDate | undefined): 
    { subgroupTotalHours: SubGroupTotalHoursType[], totalHoursOfAllSubgroups: number} | undefined {
    if (!rawSubgroups) {
      return;
    }

    let totalHoursOfAllSubgroups = 0;

    const subgroupTotalHours = Object.values(rawSubgroups).reduce<SubGroupTotalHoursType[]>((subgroupTotalHoursAcc, rawSubgroup) => {
      const totalHours = Object.values(rawSubgroup).reduce<number>((totalHours, dateAttr) => {
        if (typeof dateAttr === 'string') {
          return totalHours;
        }

        let firstPart = 0;
        // This is responsable to calculate the first part of the time spent on the project by the worker/crew manager
        if (dateAttr[EventType.StartingToWork] && dateAttr[EventType.BeforeLunch]) {
          firstPart = (dateAttr[EventType.BeforeLunch] as any) - (dateAttr[EventType.StartingToWork] as any);
        }

        let secondPart = 0;
        // This is responsable to calculate the second part of the time spent on the project by the worker/crew manager
        if (dateAttr[EventType.AfterLunch] && dateAttr[EventType.StoppingWorking]) {
          secondPart = (dateAttr[EventType.StoppingWorking] as any) - (dateAttr[EventType.AfterLunch] as any);
        }

        //Calculating the total hours spent by the worker/crew manager
        return totalHours + firstPart + secondPart;
      }, 0);

      if (totalHours > 0) {
        totalHoursOfAllSubgroups += totalHours;
        subgroupTotalHoursAcc.push({ subgroupName: rawSubgroup['name'], totalHours } as SubGroupTotalHoursType)
      }

      return subgroupTotalHoursAcc;
    }, []);

    return { subgroupTotalHours, totalHoursOfAllSubgroups }
  }

  generateTotalHoursPerGroup(rawTotalHoursPerGroup: RawTotalHoursPerGroupType): GroupTotalHoursType[] {
    return Object.values(rawTotalHoursPerGroup).reduce<GroupTotalHoursType[]>((totalHoursPerGroupAcc, rawGroup) => {
      const groupTotalHours: GroupTotalHoursType = { groupName: rawGroup.name, totalHours: 0 };

      const totalHoursPerCrewManager = this.generateTotalHoursPerSubgroup(rawGroup.crewManagers);
      
      if (totalHoursPerCrewManager) {
        groupTotalHours.totalHours+= totalHoursPerCrewManager.totalHoursOfAllSubgroups;
        groupTotalHours['crewManagers'] = totalHoursPerCrewManager.subgroupTotalHours;
      }

      const totalHoursPerWorker = this.generateTotalHoursPerSubgroup(rawGroup.workers);
      
      if (totalHoursPerWorker) {
        console.log('worker time', this.convertToTime(totalHoursPerWorker.totalHoursOfAllSubgroups))
        groupTotalHours.totalHours+= totalHoursPerWorker.totalHoursOfAllSubgroups;
        groupTotalHours['workers'] = totalHoursPerWorker.subgroupTotalHours;
      }

      const totalHoursPerProject = this.generateTotalHoursPerSubgroup(rawGroup.projects);
      
      if (totalHoursPerProject) {
        groupTotalHours.totalHours+= totalHoursPerProject.totalHoursOfAllSubgroups;
        groupTotalHours['projects'] = totalHoursPerProject.subgroupTotalHours;
      }

      if (groupTotalHours.totalHours > 0) {
        totalHoursPerGroupAcc.push(groupTotalHours);
      }
      console.log("the total hours", this.convertToTime(groupTotalHours.totalHours))

      return totalHoursPerGroupAcc;
    }, [])
  }

  convertToTime(num: number){ 
    const hours = Math.floor(num / (60 * 60 * 1000)); // Calculate hours
    const minutes = Math.floor((num % (60 * 60 * 1000)) / (60 * 1000)); // Calculate minutes
    
    // Format the result as "H:MM"
    return `${hours}:${minutes.toString().padStart(2, '0')}`;      
  }

  generateTotalHoursPerProject(eventLogAttributesFilter: EventLogAttributesFilter|undefined) {
    this.eventLoggerService.filter = eventLogAttributesFilter;
  }

}
