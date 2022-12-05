import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private showAddTask: boolean = false;
  private showFilterTask: boolean = false;
  private subjectAddTask: Subject<any> = new Subject();
  private subjectFilterTask: Subject<any> = new Subject();

  toggleAddTask(){
    this.showAddTask = !this.showAddTask;
    this.subjectAddTask.next(this.showAddTask);
  }
  toggleFilterTask(){
    this.showFilterTask = !this.showFilterTask;
    this.subjectFilterTask.next(this.showFilterTask);
  }

  onToggleAddTask(): Observable<any>{
    return this.subjectAddTask.asObservable();
  }
  
  onToggleFilterTask(): Observable<any>{
    return this.subjectFilterTask.asObservable();
  }
}
