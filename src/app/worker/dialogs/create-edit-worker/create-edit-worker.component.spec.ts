import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditWorkerComponent } from './create-edit-worker.component';

describe('CreateEditWorkerComponent', () => {
  let component: CreateEditWorkerComponent;
  let fixture: ComponentFixture<CreateEditWorkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditWorkerComponent]
    });
    fixture = TestBed.createComponent(CreateEditWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
