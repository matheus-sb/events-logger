import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEditCrewManagerComponent } from './create-edit-crew-manager.component';

describe('CreateEditCrewManagerComponent', () => {
  let component: CreateEditCrewManagerComponent;
  let fixture: ComponentFixture<CreateEditCrewManagerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateEditCrewManagerComponent]
    });
    fixture = TestBed.createComponent(CreateEditCrewManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
