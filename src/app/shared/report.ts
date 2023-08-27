import { EventType } from "./event-log"

export enum ReportType {
    TotalHoursPerProject,
    TotalHoursPerCrewManager,
    TotalHoursPerWorker
}

export type SubgroupPerDateType = {
    [key in EventType]?: Date
}

export type RawEventAndDateTypePerSubGroupIdAndDate = {
    [key: number]: {
        [key: string]: SubgroupPerDateType | string
    }
}

export type RawTotalHoursPerGroupType = {
    [key: number]: {
        [key in SubgroupType]?: RawEventAndDateTypePerSubGroupIdAndDate;
    } & {
        name: string;
    }
}

export type GroupAttributes = {
    idAttr: 'projectId'|'crewManagerId'|'workerId';
    nameAttr: 'projectName'|'crewManagerName'|'workerName';
} 

export type SubgroupType = 'crewManagers' | 'workers' | 'projects';

export type SubGroupTotalHoursType = {
    subgroupName: string;
    totalHours: number
}

export type GroupTotalHoursType =
{
    [key in SubgroupType]?: SubGroupTotalHoursType[]
} & {
    groupName: string;
    totalHours: number;
}