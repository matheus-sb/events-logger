import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, throwError } from 'rxjs';
import { Worker } from '../shared/worker';
import { CrudService } from '../services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class WorkerService {
  private table = 'workers';
  private skippedItems = 0;
  private batchSize = 15;
  public workersSubject = new BehaviorSubject<Worker[]>([]);
  public filterSubject = new BehaviorSubject<string | null>(null);

  workers$: Observable<Worker[]> = this.workersSubject.asObservable();

  constructor(private crudService: CrudService) {
    this.filterSubject.subscribe((filterText) => {
      if (filterText !== null) {
        this.skippedItems = 0;
        this.loadMoreWorkers();
      }
    });
  }

  get filter(): string {
    return this.filterSubject.value as string;
  }

  set filter(filterText: string) {
    this.filterSubject.next(filterText);
  }

  createWorker(worker: Worker) {
    return this.crudService.create(this.table, worker).pipe(
      catchError((error) => {
        console.error('Error creating worker:', error);
        return throwError(() => new Error('Failed to create worker. Please try again later.'));
      })
    );
  }

  getAllWorkers() {
    return this.crudService.getAll(this.table).pipe(
      catchError((error) => {
        console.error('Error fetching workers:', error);
        return throwError(() => new Error('Failed to fetch workers. Please try again later.'));
      })
    );
  }

  updateWorker(updatedWorker: Worker) {
    return this.crudService.update(this.table, updatedWorker).pipe(
      catchError((error) => {
        console.error('Error updating worker:', error);
        return throwError(() => new Error('Failed to update worker. Please try again later.'));
      })
    );
  }

  deleteWorker(id: number) {
    return this.crudService.delete(this.table, id).pipe(
      catchError((error) => {
        console.error('Error deleting worker:', error);
        return throwError(() => new Error('Failed to delete worker. Please try again later.'));
      })
    );
  }

  loadMoreWorkers(): void {
    this.crudService.getRange<Worker>(this.table, this.skippedItems, this.batchSize, (data) => this.filterWorkers(data))
      .subscribe({
        next: newWorkers => {
          const currentWorkers = this.workersSubject.getValue();

          if (this.skippedItems === 0 ) { // It's the top of the list
            this.skippedItems += this.batchSize;
            this.workersSubject.next(newWorkers); 
          } else if (newWorkers.length === 0) { // if there are no more workers send the current ones
            this.workersSubject.next(currentWorkers);
          } else {
            this.skippedItems += this.batchSize;
            this.workersSubject.next([...currentWorkers, ...newWorkers]);
          }
        },
        error: error => {
          console.error(error);
        }
    });
  }

  private filterWorkers(data: Worker[]): Worker[] {
    return data.slice().filter((worker) => {
      const searchStr = (worker.id + worker.name).toLowerCase();
      return this.filter == null || searchStr.indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  // Reset the worker list
  refreshWorkers(): void {
    this.skippedItems = 0;
    this.filterSubject.next(null);
    this.loadMoreWorkers();
  }
}
