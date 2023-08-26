import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, NgZone, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Observable, Subject, debounceTime, distinctUntilChanged, filter, map, pairwise, takeUntil, throttleTime } from 'rxjs';

@Component({
  selector: 'app-async-autocomplete',
  templateUrl: './async-autocomplete.component.html',
  styleUrls: ['./async-autocomplete.component.css']
})
export class AsyncAutocompleteComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('input') input!: ElementRef<HTMLInputElement>;
  @ViewChild('scroller') scroller!: CdkVirtualScrollViewport;

  @Input() displayAttr: string = 'name';
  @Input() label: string = 'Name';
  @Input() isRequired: boolean = true;
  @Input({ required: true }) data!: Observable<{[key:string]: any}[]>;
  @Input() value: {[key:string]: any} | undefined;

  @Output() filteredBy: EventEmitter<string|null> = new EventEmitter<string|null>();
  @Output() selectedItem: EventEmitter<{[key:string]: any}|null> = new EventEmitter<{[key:string]: any}|null>();
  @Output() loadMoreItems: EventEmitter<void> = new EventEmitter<void>();

  private filterText$ = new Subject<string>();
  private unsubscribe$ = new Subject<void>();
  items:{[key:string]: any}[] = [];
  
  myControl = new FormControl<any>('');

  constructor(private ngZone: NgZone) { }

  ngOnInit() {
    if (this.isRequired) {
      this.myControl.addValidators(Validators.required);
    }
    
    if (this.value) {
      this.myControl.setValue(this.value);
    }

    this.myControl.valueChanges.pipe(
      takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
      distinctUntilChanged()
    ).subscribe((value) => {
      const newValue = this.displayFn(value);
      this.filteredBy.emit(newValue);
      this.selectedItem.emit(value as {[key:string]: any}|null);
    });

    this.filterText$.pipe(
      takeUntil(this.unsubscribe$), // Unsubscribe when the component is destroyed
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((filterText) => {
      this.filteredBy.emit(filterText);
    });

    this.data
      .pipe(takeUntil(this.unsubscribe$)) // Unsubscribe when the component is destroyed
      .subscribe(items => {
        this.items = items; // Update the component's items array when data change
      });
  }

  ngAfterViewInit(): void {
    this.scroller.elementScrolled().pipe(
      map(() => this.scroller.measureScrollOffset('bottom')),
      pairwise(),
      filter(([y1, y2]) => (y2 < y1 && y2 < 25)),
      throttleTime(200)
    ).subscribe(() => {
      this.ngZone.run(() => {
        this.loadMoreItems.emit();
      });
    }
    );
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next(); // Signal to unsubscribe from subscriptions
    this.unsubscribe$.complete(); // Complete the subject
  }

  displayFn(item: any): string {
    return item && item[this.displayAttr] ? item[this.displayAttr] : '';
  }

  // Wrapping displayFn allows access this class attributes
  wrapDisplayFn(): ((value: any) => string) {
    return (item) => this.displayFn(item);
  }

  filter(): void {
    let filterValue = this.input.nativeElement.value.toLowerCase();
    filterValue = typeof filterValue === 'string' ? filterValue : filterValue[this.displayAttr];
    this.filterText$.next(filterValue);
  }

  trackItem(index:any, item:any) {
    return item.id;
  }
}
