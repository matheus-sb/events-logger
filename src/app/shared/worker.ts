import { CrewManagerService } from "../crew-manager/crew-manager.service";
import { Identifiable } from "./identifiable";

export interface Worker extends Identifiable {
    name: string;
    image: string;
    crewManagerId: number
}

export type RelationshipsType = {[key in RelationshipType]: Identifiable} | null;

export interface WorkerDialogData {
    title: string;
    worker: Worker;
    crewManagerService: CrewManagerService;
    relationships: RelationshipsType;
}

export type RelationshipType = 'crewManager'

export enum WorkerSortOrderType {
    AscendingByName,
    Reversed
  }
  
  export enum WorkerFilterType {
    CompleteTextSearch,
    ByName
  }