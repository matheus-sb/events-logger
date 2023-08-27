import { Identifiable } from "./identifiable";

export interface Project extends Identifiable{
  name: string;
  address: string;
}

export interface ProjectDialogData {
  title: string;
  project: Project;
}

export enum ProjectSortOrderType {
  AscendingByName,
  Reversed
}

export enum ProjectFilterType {
  CompleteTextSearch,
  ByName
}