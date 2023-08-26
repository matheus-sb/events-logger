import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { EventLoggerDialogData, EventType } from 'src/app/shared/event-log';
import { FileInfo } from 'src/app/shared/file-info';
import { WorkerDialogData } from 'src/app/shared/worker';

@Component({
  selector: 'app-create-edit-event-logger',
  templateUrl: './create-edit-event-logger.component.html',
  styleUrls: ['./create-edit-event-logger.component.css']
})
export class CreateEditEventLoggerComponent {
  eventLogForm: FormGroup;
  dialogTitle: string;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateEditEventLoggerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: EventLoggerDialogData
  ) {
    this.dialogTitle = data.title;
    this.isEditing = !!data.eventLog;

    this.eventLogForm = this.fb.group({
      id: { value: 0, disabled: this.isEditing },
      date: [null, this.isEditing ? Validators.required : null],
      eventType: [null, Validators.required],
      description: ['', Validators.required],
      projectId: [null, Validators.required],
      crewManagerId: [null, Validators.required],
      workerId: [null],
      filesInfo: [[]],
    });

    if (data.eventLog) {
      this.eventLogForm.patchValue(data.eventLog);
    }
  }

  get filesInfo() { return this.eventLogForm.get('filesInfo')?.value; }

  set filesInfo(filesInfo: any) { 
    this.eventLogForm.get('filesInfo')?.setValue(filesInfo);
  }

  set projectId(projectId: number|null) { 
    this.eventLogForm.get('projectId')?.setValue(projectId);
  }

  set crewManagerId(crewManagerId: number|null) { 
    this.eventLogForm.get('crewManagerId')?.setValue(crewManagerId);
  }

  set workerId(workerId: number|null) { 
    this.eventLogForm.get('workerId')?.setValue(workerId);
  }

  isInvalid(control: AbstractControl) {
    return control?.invalid && (control?.dirty || control?.touched)
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.eventLogForm.valid) {
      this.dialogRef.close(this.eventLogForm.getRawValue());
    }
  }

  getEventType() {
    return EventType;
  }

  onFilesInfoChange(filesInfo: FileInfo[]) {
    this.filesInfo = filesInfo;
  }

  onProjectFilteredBy(filterText: string|null) {
    this.setFilter(this.data.projectService, filterText);
  }

  onCrewManagerFilteredBy(filterText: string|null) {
    this.setFilter(this.data.crewManagerService, filterText);
  }

  onWorkerFilteredBy(filterText: string|null) {
    this.setFilter(this.data.workerService, filterText);
  }

  private setFilter(service: any, filterText: string|null) {
   service.filter = filterText || '';
  }

  onProjectSelectedItem(item: any) {
    this.projectId = this.getItemId(item);
   }

  onCrewManagerSelectedItem(item: any) {
   this.crewManagerId = this.getItemId(item);
  }

  onWorkerSelectedItem(item: any) {
    this.workerId = this.getItemId(item);
  }

  private getItemId(item: any) {
    return item ? item.id : null;
  }

  onProjectLoadMoreItems(event: any) {
    this.data.projectService.loadMoreProjects();
  }

  onCrewManagerLoadMoreItems(event: any) {
    this.data.crewManagerService.loadMoreCrewManagers();
  }

  onWorkerLoadMoreItems(event: any) {
    this.data.workerService.loadMoreWorkers();
  }
}

