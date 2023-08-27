import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalHoursPerWorkerComponent } from './total-hours-per-worker.component';

describe('TotalHoursPerWorkerComponent', () => {
  let component: TotalHoursPerWorkerComponent;
  let fixture: ComponentFixture<TotalHoursPerWorkerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalHoursPerWorkerComponent]
    });
    fixture = TestBed.createComponent(TotalHoursPerWorkerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
