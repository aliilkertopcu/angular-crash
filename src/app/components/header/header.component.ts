import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {Router} from '@angular/router';
import { UiService } from 'src/app/services/ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  title = 'Task Tracker';
  showAddTask: boolean = false;
  showFilterTask: boolean = false; // will be false
  subscription: Subscription;

  constructor(private uiService: UiService, private router: Router) {
    this.subscription = uiService
      .onToggleAddTask()
      .subscribe((value) => (
        this.showAddTask = value
      ));

    this.subscription = uiService
      .onToggleFilterTask()
      .subscribe((value) => (
        this.showFilterTask = value
      ));
  }

  ngOnInit(): void {

  }

  toggleAddTask() {
    this.uiService.toggleAddTask();
  }
  toggleFilterTask() {
    this.uiService.toggleFilterTask();
  }

  hasRoute(route: string): boolean{
    return this.router.url === route;
  }
}
