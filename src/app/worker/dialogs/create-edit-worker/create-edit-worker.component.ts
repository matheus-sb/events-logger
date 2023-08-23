import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { WorkerDialogData } from 'src/app/shared/worker';

@Component({
  selector: 'app-create-edit-worker',
  templateUrl: './create-edit-worker.component.html',
  styleUrls: ['./create-edit-worker.component.css']
})
export class CreateEditWorkerComponent {
  workerForm: FormGroup;
  dialogTitle: string;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateEditWorkerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WorkerDialogData
  ) {
    this.dialogTitle = data.title;
    this.isEditing = !!data.worker;

    this.workerForm = this.fb.group({
      id: { value: 0, disabled: this.isEditing },
      name: ['', Validators.required],
      image: ['', Validators.required],
      crewManagerId: [null, Validators.required]
    });

    if (data.worker) {
      this.workerForm.patchValue(data.worker);
    }
  }

  get name() { return this.workerForm.get('name'); }

  get image() { return this.workerForm.get('image'); }

  set image(image: any) { 
    this.workerForm.get('image')?.setValue(image);
  }

  set crewManagerId(crewManagerId: number|null) { 
    this.workerForm.get('crewManagerId')?.setValue(crewManagerId);
  }

  isInvalid(control: AbstractControl) {
    return control?.invalid && (control?.dirty || control?.touched)
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.workerForm.valid) {
      this.dialogRef.close(this.workerForm.getRawValue());
    }
  }

  onImageSelected(selectedImage: string) {
    this.image = selectedImage;
  }

  onFilteredBy(filterText: string|null) {
    this.data.crewManagerService.filter = filterText || '';
  }

  onSelectedItem(item: any) {
   this.crewManagerId = item ? item.id : null;
  }

  onLoadMoreItems(aaa: any) {
    this.data.crewManagerService.loadMoreCrewManagers();
  }
}
