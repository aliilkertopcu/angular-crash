import { Component, EventEmitter, Output } from '@angular/core';
import { Observable, map } from 'rxjs'
import { HttpClient } from '@angular/common/http'
import { TaskService } from 'src/app/services/task.service';
import { Task } from 'src/app/Task';
import { FormControl, FormGroup, Validators } from '@angular/forms';

type AutoCompleteDataSource = (text: string, maxResultLength: number) => Observable<{ resultLength: number, result: (string | { name: string, label: string })[] }>;
type OptionData = string | { name: string, label: string };

@Component({
  selector: 'app-filter-task',
  templateUrl: './filter-task.component.html',
  styleUrls: ['./filter-task.component.css']
})

export class FilterTaskComponent {
  private apiUrl: string = 'http://localhost:5000/tasks';
  dataSource: AutoCompleteDataSource;
  @Output() onSearchTasks: EventEmitter<OptionData> = new EventEmitter();

  filterForm = new FormGroup({
    "textFilter": new FormControl<OptionData>('', {nonNullable: true}),
    "dateFilter": new FormControl('01/01/2022', Validators.required)
  });

  onSubmit() {
    this.onSearchTasks.emit(this.filterForm.value.textFilter);
    console.log("reactive form submitted");
    console.log(this.filterForm);
  }


  constructor(private taskService: TaskService, private http: HttpClient) {
    this.dataSource = (query: string, maxResultLength: number) => {
      const url = `${this.apiUrl}?text_like=${query}`;
      return this.http.get<Task[]>(url).pipe(
        map(tasks => (
          {
            resultLength: tasks.length,
            result: tasks.map(t => t.text).slice(0, maxResultLength)
          }
        ))
      )
    }
  }
}