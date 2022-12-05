import { Component, OnInit } from '@angular/core';
import { Task } from 'src/app/Task';
import { TaskService } from 'src/app/services/task.service';
import { UiService } from 'src/app/services/ui.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  tasks: Task[] = [];
  showAddTask: boolean = false;
  showFilterTask: boolean = false;

  constructor(private taskService: TaskService, private uiService: UiService) { }

  ngOnInit(): void {
    this.taskService
      .getTasks()
      .subscribe((tasks) => (this.tasks = tasks));
    
    this.uiService
      .onToggleAddTask()
      .subscribe((value) => (this.showAddTask = value));
    this.uiService
      .onToggleFilterTask()
      .subscribe((value) => (this.showFilterTask = value));
  }

  deleteTask(task: Task): void {
    this.taskService
      .deleteTask(task)
      .subscribe(
        () => (this.tasks = this.tasks.filter(
          (t) => (t.id !== task.id)
        )));
  }

  toggleReminder(task: Task): void {
    task.reminder = !task.reminder;
    this.taskService
      .updateTask(task)
      .subscribe();
  }

  addTask(newTask: Task): void {
    this.taskService
      .addTask(newTask)
      .subscribe((task => (
        this.tasks.push(task)
      )));
  }

  searchTasks(query: string | { name: string, label: string }): void {
    this.taskService
      .searchTasks(query.toString())
      .subscribe((tasks => (
        this.tasks = tasks
      )));
  }
}
