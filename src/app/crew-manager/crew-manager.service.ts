import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { CrudService } from '../services/crud.service';
import { CrewManager, CrewManagerFilterType, CrewManagerSortOrderType } from '../shared/crew-manager';

@Injectable({
  providedIn: 'root'
})
export class CrewManagerService {
  private table = 'crew-managers';
  private skippedItems = 0;
  private batchSize = 15;
  private filterType: CrewManagerFilterType = CrewManagerFilterType.ByName;
  private sortOrderType: CrewManagerSortOrderType = CrewManagerSortOrderType.AscendingByName;
  public crewManagersSubject = new BehaviorSubject<CrewManager[]>([]);
  public filterSubject = new BehaviorSubject<string | null>(null);

  crewManagers$: Observable<CrewManager[]> = this.crewManagersSubject.asObservable();

  constructor(private crudService: CrudService) {
    this.filterSubject.subscribe((filterText) => {
      if (filterText !== null) {
        this.skippedItems = 0;
        this.loadMoreCrewManagers();
      }
    });
  }

  get filter(): string {
    return this.filterSubject.value as string;
  }

  set filter(filterText: string) {
    this.filterSubject.next(filterText);
  }

  setFilterAndSortOrderTypes(filterType: CrewManagerFilterType, sortOrderType: CrewManagerSortOrderType) {
    this.filterType = filterType;
    this.sortOrderType = sortOrderType;
    this.skippedItems = 0;
  }

  createCrewManager(crewManager: CrewManager) {
    return this.crudService.create(this.table, crewManager).pipe(
      catchError((error) => {
        console.error('Error creating crew manager:', error);
        return throwError(() => new Error('Failed to create crew manager. Please try again later.'));
      })
    );
  }

  getCrewManagerById(id: number) {
    return this.crudService.getById<CrewManager>(this.table, id).pipe(
      catchError((error) => {
        console.error('Error fetching crew manager by id:', error);
        return throwError(() => new Error('Failed to fetch crew manager by id. Please try again later.'));
      })
    );
  }

  getAllCrewManagers() {
    return this.crudService.getAll(this.table).pipe(
      catchError((error) => {
        console.error('Error fetching crew managers:', error);
        return throwError(() => new Error('Failed to fetch crew managers. Please try again later.'));
      })
    );
  }

  updateCrewManager(updatedCrewManager: CrewManager) {
    return this.crudService.update(this.table, updatedCrewManager).pipe(
      catchError((error) => {
        console.error('Error updating crew manager:', error);
        return throwError(() => new Error('Failed to update crew manager. Please try again later.'));
      })
    );
  }

  deleteCrewManager(id: number) {
    return this.crudService.delete(this.table, id).pipe(
      catchError((error) => {
        console.error('Error deleting crew manager:', error);
        return throwError(() => new Error('Failed to delete crew manager. Please try again later.'));
      })
    );
  }

  loadMoreCrewManagers(): void {
    this.crudService.getRange<CrewManager>(this.table, this.skippedItems, this.batchSize, (data) => this.filterAndSortCrewManagers(data))
      .subscribe({
        next: newCrewManagers => {
          const currentCrewManagers = this.crewManagersSubject.getValue();

          if (this.skippedItems === 0) { // It's the top of the list
            this.skippedItems += this.batchSize;
            this.crewManagersSubject.next(newCrewManagers);
          } else if (newCrewManagers.length === 0) { // if there are no more crew managers send the current ones
            this.crewManagersSubject.next(currentCrewManagers);
          } else {
            this.skippedItems += this.batchSize;
            this.crewManagersSubject.next([...currentCrewManagers, ...newCrewManagers]);
          }
        },
        error: error => {
          console.error(error);
        }
      });
  }

  private filterCompleteTextSearch(crewManagers: CrewManager[]): CrewManager[] {
    return crewManagers.slice().filter((crewManager) => {
      const searchStr = (crewManager.id + crewManager.name).toLowerCase();
      return this.filter == null || searchStr.indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  private filterByName(crewManagers: CrewManager[]): CrewManager[] {
    return crewManagers.slice().filter((crewManager) => {
      return this.filter == null || crewManager.name.toLowerCase().indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  private filterCrewManagers(crewManagers: CrewManager[]): CrewManager[] {
    switch (this.filterType) {
      case CrewManagerFilterType.CompleteTextSearch:
        return this.filterCompleteTextSearch(crewManagers);
      case CrewManagerFilterType.ByName:
        return this.filterByName(crewManagers);
      default:
        return crewManagers;
    }
  }

  private sortCrewManagers(crewManagers: CrewManager[]): CrewManager[] {
    switch (this.sortOrderType) {
      case CrewManagerSortOrderType.Reversed:
        return crewManagers.slice().reverse();
        case CrewManagerSortOrderType.AscendingByName:
          return crewManagers.slice().sort((a, b) => a.name.localeCompare(b.name));
      default:
        return crewManagers;
    }
  }

  private filterAndSortCrewManagers(data: CrewManager[]): CrewManager[] {
    const newData = this.filterCrewManagers(data);
    return this.sortCrewManagers(newData);
  }

  // Reset the crew manager list
  refreshCrewManagers(): void {
    this.skippedItems = 0;
    this.filterSubject.next(null);
    this.loadMoreCrewManagers();
  }
}
