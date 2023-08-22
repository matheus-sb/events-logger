import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CrewManagerDialogData } from 'src/app/shared/crew-manager';

@Component({
  selector: 'app-create-edit-crew-manager',
  templateUrl: './create-edit-crew-manager.component.html',
  styleUrls: ['./create-edit-crew-manager.component.css']
})
export class CreateEditCrewManagerComponent {
  crewManagerForm: FormGroup;
  dialogTitle: string;
  isEditing: boolean;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CreateEditCrewManagerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CrewManagerDialogData,
  ) {
    this.dialogTitle = data.title;
    this.isEditing = !!data.crewManager;

    this.crewManagerForm = this.fb.group({
      id: { value: 0, disabled: this.isEditing },
      name: ['', Validators.required],
      image: ['', Validators.required]
    });

    if (data.crewManager) {
      this.crewManagerForm.patchValue(data.crewManager);
    }
  }

  get name() { return this.crewManagerForm.get('name'); }

  get image() { return this.crewManagerForm.get('image'); }

  set image(image: any) { 
    this.crewManagerForm.get('image')?.setValue(image);
  }

  isInvalid(control: AbstractControl) {
    return control?.invalid && (control?.dirty || control?.touched)
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.crewManagerForm.valid) {
      this.dialogRef.close(this.crewManagerForm.getRawValue());
    }
  }

  onImageSelected(selectedImage: string) {
    this.image = selectedImage;
  }
}
