import { Component, Input, Output, EventEmitter, OnChanges } from '@angular/core';
@Component({
  selector: 'app-autocomplete-option',
  templateUrl: './autocomplete-option.component.html',
  styleUrls: ['./autocomplete-option.component.css']
})
export class AutocompleteOptionComponent {
  @Input() query: string = '';
  @Input() option!: { optionData: string | { name: string; label: string; }; isHighlighted: boolean; };
  
  @Output() select: EventEmitter<string | { name: string, label: string }> = new EventEmitter();

  highLightedPart: string = '';
  prefix: string = '';
  suffixes: string[] = [];

  ngOnChanges(){
    let index = this.option.optionData
      .toString()
      .toUpperCase()
      .indexOf(
        this.query.toUpperCase()
      )
    this.highLightedPart = this.option.optionData.toString().substring(index, index + this.query.length);

    [this.prefix, ...this.suffixes] = this.option.optionData.toString().split(this.highLightedPart);
  }

  onSelect() {
    this.select.emit(this.option.optionData);
  }
}