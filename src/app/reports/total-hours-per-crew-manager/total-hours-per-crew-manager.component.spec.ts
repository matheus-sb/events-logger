import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalHoursPerCrewManagerComponent } from './total-hours-per-crew-manager.component';

describe('TotalHoursPerCrewManagerComponent', () => {
  let component: TotalHoursPerCrewManagerComponent;
  let fixture: ComponentFixture<TotalHoursPerCrewManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TotalHoursPerCrewManagerComponent]
    });
    fixture = TestBed.createComponent(TotalHoursPerCrewManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
