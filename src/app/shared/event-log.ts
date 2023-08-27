import { ProjectService } from "../project/project.service";
import { CrewManagerService } from "../crew-manager/crew-manager.service";
import { WorkerService } from "../worker/worker.service";
import { FileInfo } from "./file-info";
import { Identifiable } from "./identifiable";

export interface EventLog extends Identifiable {
    date: Date
    eventType: EventType;
    description: string;
    projectId: number;
    projectName?: string;
    crewManagerId: number;
    crewManagerName?: string;
    workerId: number;
    workerName?: string;
    filesInfo: FileInfo[];
}

export type EventLoggerRelationshipsType = {[key in RelationshipType]: Identifiable | undefined} | null;

export interface EventLoggerDialogData {
    title: string;
    eventLog: EventLog;
    projectService: ProjectService;
    crewManagerService: CrewManagerService;
    workerService: WorkerService;
    relationships: EventLoggerRelationshipsType;
}

export type RelationshipType = 'project' | 'crewManager' | 'worker'

export enum EventType {
    StartingToWork = 'STARTING_TO_WORK',
    BeforeLunch = 'BEFORE_LUNCH',
    AfterLunch = 'AFTER_LUNCH',
    StoppingWorking = 'STOPPING_WORKING'
}

export enum EventLogSortOrderType {
    Reversed
}

export enum EventLogFilterType {
    ByAttributes,
    CompleteTextSearch
}

export interface EventLogAttributesFilter  {
    projectId?: number;
    crewManagerId?: number;
    workerId?: number;
    hasFiles?: boolean;
    dateFrom?: Date|null;
    dateTo?: Date|null;
}