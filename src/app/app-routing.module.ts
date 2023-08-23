import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProjectComponent } from './project/project.component';
import { CrewManagerComponent } from './crew-manager/crew-manager.component';
import { WorkerComponent } from './worker/worker.component';

const routes: Routes = [
  { path: '', component: ProjectComponent },
  { path: 'projects', component: ProjectComponent },
  { path: 'crew-managers', component: CrewManagerComponent },
  { path: 'workers', component: WorkerComponent },
  { path: 'event-logger', component: ProjectComponent },
  { path: 'total-hours-per-project', component: ProjectComponent },
  { path: 'total-hours-per-crew', component: ProjectComponent },
  { path: 'total-hours-per-manager', component: ProjectComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
