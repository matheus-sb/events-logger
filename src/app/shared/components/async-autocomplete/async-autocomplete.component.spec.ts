import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsyncAutocompleteComponent } from './async-autocomplete.component';

describe('AsyncAutocompleteComponent', () => {
  let component: AsyncAutocompleteComponent;
  let fixture: ComponentFixture<AsyncAutocompleteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AsyncAutocompleteComponent]
    });
    fixture = TestBed.createComponent(AsyncAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
