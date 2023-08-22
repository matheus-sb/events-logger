import { Identifiable } from "./identifiable";

export interface CrewManager extends Identifiable {
    name: string,
    image: string
}

export interface CrewManagerDialogData {
    title: string;
    crewManager: CrewManager;
  }