import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventLoggerComponent } from './event-logger.component';

describe('EventLoggerComponent', () => {
  let component: EventLoggerComponent;
  let fixture: ComponentFixture<EventLoggerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EventLoggerComponent]
    });
    fixture = TestBed.createComponent(EventLoggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
