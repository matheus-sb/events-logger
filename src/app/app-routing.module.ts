import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project/project.component';
import { CrewManagerComponent } from './crew-manager/crew-manager.component';
import { WorkerComponent } from './worker/worker.component';
import { EventLoggerComponent } from './event-logger/event-logger.component';
import { TotalHoursPerProjectComponent } from './reports/total-hours-per-project/total-hours-per-project.component';
import { TotalHoursPerCrewManagerComponent } from './reports/total-hours-per-crew-manager/total-hours-per-crew-manager.component';
import { TotalHoursPerWorkerComponent } from './reports/total-hours-per-worker/total-hours-per-worker.component';

const routes: Routes = [
  { path: '', component: ProjectComponent },
  { path: 'projects', component: ProjectComponent },
  { path: 'crew-managers', component: CrewManagerComponent },
  { path: 'workers', component: WorkerComponent },
  { path: 'event-logger', component: EventLoggerComponent },
  { path: 'total-hours-per-project', component: TotalHoursPerProjectComponent },
  { path: 'total-hours-per-crew', component: TotalHoursPerCrewManagerComponent },
  { path: 'total-hours-per-manager', component: TotalHoursPerWorkerComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
