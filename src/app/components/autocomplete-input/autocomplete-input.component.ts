import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, forwardRef } from '@angular/core';
import { Observable, Subscription, Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';


type OptionData = string | { name: string, label: string };
type OptionModel = { optionData: OptionData, isHighlighted: boolean };
type AutoCompleteDataSource = (text: string, maxResultLength: number) => Observable<{ resultLength: number, result: OptionData[] }>;

@Component({
  selector: 'app-autocomplete-input',
  templateUrl: './autocomplete-input.component.html',
  styleUrls: ['./autocomplete-input.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteInputComponent),
      multi: true,
    }
  ]
})
export class AutocompleteInputComponent implements OnInit, OnDestroy, ControlValueAccessor {

  @ViewChild('input') input: ElementRef | undefined;

  private searchSubscription?: Subscription;
  private readonly searchSubject = new Subject<string | undefined>();
  private _cachedQueryStartPoint: string = '';
  private _cachedResults: OptionModel[] = [];

  query: string = '';
  highLightedIndex: number = 0;
  options: OptionModel[] = [];
  optionsLength: number = 0;
  selectedOption: OptionData = '';
  isOpen: boolean = false;

  onChange: any = () => { };
  onTouched: any = () => { };

  @Input('value') val: OptionData  = '';;

  // Data source to query for results
  @Input()
  dataSource!: AutoCompleteDataSource;

  // The minimum length of the input string to issue the first request
  @Input() minInputLength: number = 3;

  // Milliseconds to debounce subsequent requests
  @Input() debounceMilliSeconds: number = 1000;

  // Maximum number results requested and handled internally by the component
  @Input() maxResultLength: number = 10000;

  // Maximum number of options from the result list provided for selection
  @Input() maxDisplayLength: number = 50;

  // If set to true, the datasource will always be asked for new matches even if the component could calculate it inline
  @Input() alwaysQuery: boolean = false;

  // Select the first value of the result list on blur
  @Input() autoSelectFirst: boolean = true;

  @Output() submit: EventEmitter<OptionData> = new EventEmitter();

  private _isCachedSearchAvailabe(): boolean {
    return this._cachedQueryStartPoint !== '' && this.query.toUpperCase().indexOf(this._cachedQueryStartPoint) !== -1;
  }

  private _caseInsensitiveSearch(option: OptionModel, query: string): boolean{
    return option.optionData
      .toString()
      .toUpperCase()
      .indexOf(query.toUpperCase()) !== -1;
  }

  ngOnInit(): void {
    this.searchSubscription = this.searchSubject
      .pipe(
        debounceTime(this.debounceMilliSeconds),
        distinctUntilChanged(),
        switchMap(() => this.dataSource(this.query, this.maxDisplayLength))
      )
      .subscribe((response) => {
        this.options = response.result.map((option) => ({ optionData: option, isHighlighted: false }))
        this.optionsLength = response.resultLength;
        if(this.optionsLength > 0 )
          this.options[0].isHighlighted = true;

        this._cachedResults = JSON.parse(JSON.stringify(this.options));
        this._cachedQueryStartPoint = this.optionsLength > this.maxDisplayLength ? '' : this.query.toUpperCase();

        console.log("did normal search", "opt lenght", this.optionsLength, "cachedQuery", this._cachedQueryStartPoint );
      });
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }

  open() {
    this.isOpen = true;
    this.highLightedIndex = 0;
  }

  close() {
    this.isOpen = false;
    this.options[this.highLightedIndex].isHighlighted = false;
  }
  onInput() {
    if (this.query.length < this.minInputLength)
      return;

    this.open();

    // checking for cached querying
    if (!this.alwaysQuery && this._isCachedSearchAvailabe()) {
      console.log("did cached search", "opt lenght", this.optionsLength, "cachedQuery", this._cachedQueryStartPoint );
      this.options = this._cachedResults.filter((option) => {
        option.isHighlighted = false
        return this._caseInsensitiveSearch(option, this.query) && option;
      });
    } else {
      this.searchSubject.next(this.query);
    }
  }

  optionSelected(option: OptionData) {
    this.writeValue(option);
    this.onChange(option);
    this.onTouched();
    this.query = option.toString();
    this.close();
  }

  onBlur() {
    // setTimeout(() => {
      this.close();
    // }, 150); // pirated solution after hours of research
  }
  onClick() {
    if(!this.isOpen){
      this.open();
      this.onInput();
    }
  }

  // Arrow Keys selection of options
  @HostListener('keydown.ArrowUp', ['$event'])
  moveUp() {
    if (!this.highLightedIndex) return; // return if 0

    this.options[this.highLightedIndex].isHighlighted = false;
    --this.highLightedIndex;
    this.options[this.highLightedIndex].isHighlighted = true;
  }

  @HostListener('keydown.ArrowDown', ['$event'])
  moveDown() {
    if (this.highLightedIndex === this.options.length - 1) return;

    this.options[this.highLightedIndex].isHighlighted = false;
    ++this.highLightedIndex;
    this.options[this.highLightedIndex].isHighlighted = true;
  }

  @HostListener('keydown.Enter', ['$event'])
  optionSelectedKeyboard() {
    this.options[this.highLightedIndex].isHighlighted = false;
    this.optionSelected(this.options[this.highLightedIndex].optionData);
  }

  @HostListener('keydown.Esc', ['$event'])
  leave() {
    this.close();
    this.input?.nativeElement.blur();
  }

  registerOnChange(fn: any){
    this.onChange = fn;
  }
  registerOnTouched(fn: any){
    this.onTouched = fn;
  }
  writeValue(selectedOption: OptionData){
    if (selectedOption) {
      this.selectedOption = selectedOption;
    }
  }
}