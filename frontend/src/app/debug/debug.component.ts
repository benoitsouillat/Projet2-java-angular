import {Component, inject, OnInit} from '@angular/core';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { UserInfoDTO } from '../core/DTO/userInfoDTO';
import {UserService} from "../core/service/user.service";
import {Observable} from "rxjs";

@Component({
  selector: 'app-debug',
  standalone: true,
  imports: [JsonPipe, AsyncPipe],
  templateUrl: './debug.component.html',
  styleUrl: './debug.component.css'
})
export class DebugComponent implements OnInit {
  readonly currentUser$ =
      inject(UserService).currentUser$;


  ngOnInit(): void {

  }

}
