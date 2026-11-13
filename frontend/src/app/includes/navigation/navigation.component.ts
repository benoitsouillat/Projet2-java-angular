import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../core/service/user.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [AsyncPipe, RouterLink],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  isAuthenticated$ = inject(UserService).isAuthenticated$;
  private readonly userService = inject(UserService);

  logout(): void {
    this.userService.logout();
  }

}
