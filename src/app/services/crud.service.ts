import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, delay } from 'rxjs/operators';
import { Identifiable } from '../shared/identifiable';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private localStorageKeyPrefix = 'data_';

  constructor() {}

  private getTableKey(table: string): string {
    return `${this.localStorageKeyPrefix}${table}`;
  }

  private saveToLocalStorage<T extends Identifiable>(table: string, items: T[]): void {
    const key = this.getTableKey(table);
    localStorage.setItem(key, JSON.stringify(items));
  }

  private getFromLocalStorage<T extends Identifiable>(table: string): T[] {
    const key = this.getTableKey(table);
    const items = localStorage.getItem(key);
    return items ? JSON.parse(items) : [];
  }

  private handleError(error: any) {
    console.error(error);
    return throwError(() => Error('An error occurred.'));
  }

  getAll<T extends Identifiable>(table: string): Observable<T[]> {
    const items = this.getFromLocalStorage<T>(table);
    return of(items).pipe(
      catchError(this.handleError)
    );
  }

  create<T extends Identifiable>(table: string, item: T): Observable<T> {
    const items = this.getFromLocalStorage<T>(table);

    const nextId = items.reduce((maxId, current) => {
      return maxId > current.id ? maxId : current.id;
    }, 0) + 1;

    const newItem = { ...item, id: nextId }

    items.push(newItem);
    this.saveToLocalStorage(table, items);
    return of(item).pipe(
      catchError(this.handleError)
    );
  }

  update<T extends Identifiable>(table: string, item: T): Observable<T> {
    const items = this.getFromLocalStorage<T>(table);
    const index = items.findIndex((x: T) => x.id === item.id);
    if (index >= 0) {
      items[index] = item;
      this.saveToLocalStorage(table, items);
      return of(item).pipe(
        catchError(this.handleError)
      );
    } else {
      return throwError(() => new Error('Item not found.'));
    }
  }

  delete(table: string, id: number): Observable<void> {
    const items = this.getFromLocalStorage<any>(table);
    const index = items.findIndex((x: any) => x.id === id);
    if (index >= 0) {
      items.splice(index, 1);
      this.saveToLocalStorage(table, items);
      return of(void 0);
    } else {
      return throwError(() => Error('Item not found.'));
    }
  }

  getRange<T extends Identifiable>(
    table: string, 
    startIndex: number,  
    batchSize: number, 
    filter: (items: T[]) => T[],
    reversedOrder: boolean = true
  ): Observable<T[]> {
    const items = this.getFromLocalStorage<T>(table);
    let newItems = reversedOrder ? items.reverse() : items;
    newItems = filter(items);
    const start = Math.max(0, startIndex);
    const end = Math.min(start + batchSize, items.length);
    const rangeItems = newItems.slice(start, end);
    return of(rangeItems).pipe(
      delay(500),
      catchError(this.handleError)
    );
  }
}
