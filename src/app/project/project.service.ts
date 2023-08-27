import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { Project, ProjectFilterType, ProjectSortOrderType } from '../shared/project';
import { CrudService } from '../services/crud.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private table = 'projects';
  private skippedItems = 0;
  private batchSize = 15;
  private filterType: ProjectFilterType = ProjectFilterType.ByName;
  private sortOrderType: ProjectSortOrderType = ProjectSortOrderType.AscendingByName;
  public projectsSubject = new BehaviorSubject<Project[]>([]);
  public filterSubject = new BehaviorSubject<string | null>(null);

  projects$: Observable<Project[]> = this.projectsSubject.asObservable();

  constructor(private crudService: CrudService) {
    this.filterSubject.subscribe((filterText) => {
      if (filterText !== null) {
        this.skippedItems = 0;
        this.loadMoreProjects();
      }
    });
  }

  get filter(): string {
    return this.filterSubject.value as string;
  }

  set filter(filterText: string) {
    this.filterSubject.next(filterText);
  }

  setFilterAndSortOrderTypes(filterType: ProjectFilterType, sortOrderType: ProjectSortOrderType) {
    this.filterType = filterType;
    this.sortOrderType = sortOrderType;
    this.skippedItems = 0;
  }

  createProject(project: Project) {
    return this.crudService.create(this.table, project).pipe(
      catchError((error) => {
        console.error('Error creating project:', error);
        return throwError(() => new Error('Failed to create project. Please try again later.'));
      })
    );
  }

  getProjectById(id: number) {
    return this.crudService.getById<Project>(this.table, id).pipe(
      catchError((error) => {
        console.error('Error fetching project by id:', error);
        return throwError(() => new Error('Failed to fetch project by id. Please try again later.'));
      })
    );
  }

  getAllProjects() {
    return this.crudService.getAll(this.table).pipe(
      catchError((error) => {
        console.error('Error fetching projects:', error);
        return throwError(() => new Error('Failed to fetch projects. Please try again later.'));
      })
    );
  }

  updateProject(updatedProject: Project) {
    return this.crudService.update(this.table, updatedProject).pipe(
      catchError((error) => {
        console.error('Error updating project:', error);
        return throwError(() => new Error('Failed to update project. Please try again later.'));
      })
    );
  }

  deleteProject(id: number) {
    return this.crudService.delete(this.table, id).pipe(
      catchError((error) => {
        console.error('Error deleting project:', error);
        return throwError(() => new Error('Failed to delete project. Please try again later.'));
      })
    );
  }

  loadMoreProjects(): void {
    this.crudService.getRange<Project>(this.table, this.skippedItems, this.batchSize, (data) => this.filterAndSortProjects(data))
      .subscribe({
        next: newProjects => {
          const currentProjects = this.projectsSubject.getValue();

          if (this.skippedItems === 0 ) { // It's the top of the list
            this.skippedItems += this.batchSize;
            this.projectsSubject.next(newProjects); 
          } else if (newProjects.length === 0) { // if there are no more projects send the current ones
            this.projectsSubject.next(currentProjects);
          } else {
            this.skippedItems += this.batchSize;
            this.projectsSubject.next([...currentProjects, ...newProjects]);
          }
        },
        error: error => {
          console.error(error);
        }
    });
  }

  private filterCompleteTextSearch(projects: Project[]): Project[] {
    return projects.slice().filter((project) => {
      const searchStr = (project.id + project.name + project.address).toLowerCase();
      return this.filter == null || searchStr.indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  private filterByName(projects: Project[]): Project[] {
    return projects.slice().filter((project) => {
      return this.filter == null || project.name.toLowerCase().indexOf(this.filter?.toLowerCase()) !== -1;
    });
  }

  private filterProjects(projects: Project[]): Project[] {
    switch (this.filterType) {
      case ProjectFilterType.CompleteTextSearch:
        return this.filterCompleteTextSearch(projects);
      case ProjectFilterType.ByName:
        return this.filterByName(projects);
      default:
        return projects;
    }
  }

  private sortProjects(projects: Project[]): Project[] {
    switch (this.sortOrderType) {
      case ProjectSortOrderType.Reversed:
        return projects.slice().reverse();
        case ProjectSortOrderType.AscendingByName:
          return projects.slice().sort((a, b) => a.name.localeCompare(b.name));
      default:
        return projects;
    }
  }

  private filterAndSortProjects(data: Project[]): Project[] {
    const newData = this.filterProjects(data);
    return this.sortProjects(newData);
  }

  // Reset the project list
  refreshProjects(): void {
    this.skippedItems = 0;
    this.filterSubject.next(null);
    this.loadMoreProjects();
  }
}
