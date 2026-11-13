import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Register } from '../models/Register';
import { loginUserDTO } from '../DTO/loginUserDTO';
import { loginResponseDTO } from '../DTO/loginResponseDTO';
import { UserInfoDTO } from '../DTO/userInfoDTO';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, map, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject: BehaviorSubject<UserInfoDTO | null> =
      new BehaviorSubject<UserInfoDTO | null>(null);

  readonly currentUser$: Observable<UserInfoDTO | null> =
      this.currentUserSubject.asObservable();

  readonly isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
      map(user => !!user)
  );

  constructor(
      private httpClient: HttpClient,
      private router: Router
  ) { }

  register(user: Register): Observable<Object> {
    return this.httpClient.post('/api/register', user);
  }

  login(user: loginUserDTO): Observable<loginResponseDTO> {
    return this.httpClient.post<loginResponseDTO>('/api/login', user);
  }

  getListStudent(token: string): Observable<Array<UserInfoDTO>> {
    return this.httpClient.post<Array<UserInfoDTO>>('/api/users', null, {headers: {authorization: token}});
  }

  getCurrentUserInfo(token: string): Observable<UserInfoDTO> {
    return this.httpClient.post<UserInfoDTO>('/api/user/info', null, {headers: {authorization: token}});
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  private clearSession(): void {
    localStorage.removeItem('userToken');
    this.currentUserSubject.next(null);
  }

  loadCurrentUser(): void {
    const token = localStorage.getItem('userToken');

    if (!token) {
      this.currentUserSubject.next(null);
      return;
    }

    this.getCurrentUserInfo(`Bearer ${token}`).subscribe({
      next: user => {
        this.currentUserSubject.next({
          ...user,
          token
        });
      },
      error: error => {
        if (error.status === 401) {
          this.clearSession();
        } else {
          console.error(
              'Impossible de récupérer l’utilisateur courant',
              error
          );
        }
      }
    });
  }

  saveToken(response: loginResponseDTO): void {
      localStorage.setItem('userToken', response.token);
      this.loadCurrentUser();
  }

}
