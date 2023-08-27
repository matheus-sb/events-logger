import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalHoursPerProjectComponent } from './total-hours-per-project.component';

describe('TotalHoursPerProjectComponent', () => {
  let component: TotalHoursPerProjectComponent;
  let fixture: ComponentFixture<TotalHoursPerProjectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalHoursPerProjectComponent]
    });
    fixture = TestBed.createComponent(TotalHoursPerProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
