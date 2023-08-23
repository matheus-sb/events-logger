import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkerComponent } from './worker.component';

describe('WorkerComponent', () => {
  let component: WorkerComponent;
  let fixture: ComponentFixture<WorkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WorkerComponent]
    });
    fixture = TestBed.createComponent(WorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
