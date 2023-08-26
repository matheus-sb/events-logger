import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditEventLoggerComponent } from './create-edit-event-logger.component';

describe('CreateEditEventLoggerComponent', () => {
  let component: CreateEditEventLoggerComponent;
  let fixture: ComponentFixture<CreateEditEventLoggerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditEventLoggerComponent]
    });
    fixture = TestBed.createComponent(CreateEditEventLoggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
