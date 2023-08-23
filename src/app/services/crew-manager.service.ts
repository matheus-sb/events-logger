import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { CrudService } from './crud.service';
import { CrewManager } from '../shared/crew-manager';

@Injectable({
  providedIn: 'root'
})
export class CrewManagerService {
  private table = 'crew-managers';
  private skippedItems = 0;
  private batchSize = 15;
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
    this.crudService.getRange<CrewManager>(this.table, this.skippedItems, this.batchSize, (data) => this.filterCrewManagers(data))
      .subscribe({
        next: newCrewManagers => {
          const currentCrewManagers = this.crewManagersSubject.getValue();

          if (this.skippedItems === 0 ) { // It's the top of the list
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

  private filterCrewManagers(data: CrewManager[]): CrewManager[] {
    return data.slice().filter((crewManager) => {
      const searchStr = (crewManager.id + crewManager.name).toLowerCase();
      return this.filter == null || searchStr.indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  // Reset the crew manager list
  refreshCrewManagers(): void {
    this.skippedItems = 0;
    this.filterSubject.next(null);
    this.loadMoreCrewManagers();
  }
}
