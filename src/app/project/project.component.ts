import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProjectService } from './project.service';
// import { ProjectDialogComponent } from './project-dialog/project-dialog.component';
import { catchError, debounceTime, distinctUntilChanged, filter, map, pairwise, switchMap, takeUntil, throttleTime } from 'rxjs/operators';
import { Project, ProjectDialogData } from '../shared/project';
import { ErrorHandlerService } from '../services/error-handler.service';
import { Observable, Subject } from 'rxjs';
import { CdkVirtualScrollViewport, } from '@angular/cdk/scrolling';
import { CreateEditProjectComponent } from './dialogs/add-project/create-edit-project.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogData } from '../shared/confirmation-dialog-data';
import { NotificationHandlerService } from '../services/notification-handler.service';

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.css']
})
export class ProjectComponent implements OnInit, OnDestroy, AfterViewInit {
  newProject: Project = { id: 0, name: '', address: '' }; // Use the Project interface
  projects: Project[] = [];
  isLoading = false;

  private unsubscribe$ = new Subject<void>();
  private filterText$ = new Subject<string>();
  

  @ViewChild('scroller') scroller!: CdkVirtualScrollViewport;
  @ViewChild('filter') filterInput!: ElementRef;

  constructor(
    private dialog: MatDialog,
    private projectService: ProjectService,
    private errorHandlerService: ErrorHandlerService,
    private ngZone: NgZone,
    private notificationHandlerService: NotificationHandlerService
  ) { }

  ngAfterViewInit(): void {
    this.scroller.elementScrolled().pipe(
      map(() => this.scroller.measureScrollOffset('bottom')),
      pairwise(),
      filter(([y1, y2]) => (y2 < y1 && y2 < 140)),
      throttleTime(200)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.isLoading = true;
        this.projectService.loadMoreProjects();
      });
    }
    );
  }

  ngOnInit() {
    this.projectService.refreshProjects(); // Initialize and load projects when the component is accessed

    this.projectService.projects$
      .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when the component is destroyed
      .subscribe(projects => {
        this.isLoading = false;
        this.projects = projects; // Update the component's projects array when projects change
      });

      this.filterText$.pipe(
        takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
        debounceTime(500),
        distinctUntilChanged()
      ).subscribe((filterText) => {
        this.projectService.filter = filterText;
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  filterProjects(filterText: string) {
    this.filterText$.next(filterText);
  }

  getValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  resetFilterInput() {
    this.filterInput.nativeElement.value = '';
  }

  onCreateOrEditProject(project: Project | null = null): void {
    const isEditing = !!project;
    const dialogTitle = isEditing ? 'Edit Project' : 'Create Project';

    const dialogRef = this.dialog.open(CreateEditProjectComponent, {
      width: '600px',
      data: { title: dialogTitle, project } as ProjectDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const project$: Observable<Project> = project ?
          this.projectService.updateProject({ ...result }) :
          this.projectService.createProject({ ...result });

        project$.pipe(
          catchError((error) => {
            return this.errorHandlerService.handleError(`Failed to ${isEditing ? 'edit' : 'create'} project. Please try again later.`);
          })
        ).subscribe(() => {
          this.notificationHandlerService.handleNotification(`Project successfully ${isEditing ? 'edited' : 'created'}!`);
          this.resetFilterInput();
          this.projectService.refreshProjects();
        });
      }
    });
  }

  onDeleteProject(project: Project) {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '600px',
      data: { title: "Delete Project", content: `Are you sure that you want to delete ${project.name} project` } as ConfirmationDialogData
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.projectService.deleteProject(project.id)
          .pipe(
            catchError((error) => {
              return this.errorHandlerService.handleError('Failed to delete project. Please try again later.');
            })
          )
          .subscribe(() => {
            this.notificationHandlerService.handleNotification('Project successfully deleted!');
            this.resetFilterInput();
            this.projectService.refreshProjects();
          });
      }
    });
  }
}
