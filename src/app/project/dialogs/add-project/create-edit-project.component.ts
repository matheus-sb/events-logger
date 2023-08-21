import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ProjectDialogData } from 'src/app/shared/project';

@Component({
  selector: 'app-create-edit-project',
  templateUrl: './create-edit-project.component.html',
  styleUrls: ['./create-edit-project.component.css']
})
export class CreateEditProjectComponent {
  projectForm: FormGroup;
  dialogTitle: string;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateEditProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ProjectDialogData,
  ) {
    this.dialogTitle = data.title;
    this.isEditing = !!data.project;

    this.projectForm = this.fb.group({
      id: { value: 0, disabled: this.isEditing },
      name: ['', Validators.required],
      address: ['', Validators.required]
    });

    if (data.project) {
      this.projectForm.patchValue(data.project);
    }
  }

  get name() { return this.projectForm.get('name'); }

  get address() { return this.projectForm.get('address'); }

  isInvalid(control: AbstractControl) {
    return control?.invalid && (control?.dirty || control?.touched)
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.projectForm.valid) {
      this.dialogRef.close(this.projectForm.getRawValue());
    }
  }
}
