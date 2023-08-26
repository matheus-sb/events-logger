import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLoggerFilterComponent } from './event-logger-filter.component';

describe('EventLoggerFilterComponent', () => {
  let component: EventLoggerFilterComponent;
  let fixture: ComponentFixture<EventLoggerFilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventLoggerFilterComponent]
    });
    fixture = TestBed.createComponent(EventLoggerFilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
