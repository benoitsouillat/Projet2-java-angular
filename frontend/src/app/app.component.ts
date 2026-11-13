import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {DebugComponent} from "./debug/debug.component";
import {UserService} from "./core/service/user.service";
import {NavigationComponent} from "./includes/navigation/navigation.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [NavigationComponent, RouterOutlet],
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'etudiant-frontend';

  constructor(private userService: UserService) {
    this.userService.loadCurrentUser();
  }
}
