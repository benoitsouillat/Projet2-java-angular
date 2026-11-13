import { TestBed } from '@angular/core/testing';

import { UserService } from './user.service';
import {provideHttpClient} from '@angular/common/http';
import {loginResponseDTO} from "../DTO/loginResponseDTO";

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient()
      ]
    });
    service = TestBed.inject(UserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should stock the token in localStorage when saveToken is called', () => {
    const response: loginResponseDTO = {
      code: 200,
      login: 'testuser',
      message: 'Login successful',
      token: 'mocked-jwt-token'
    };
    service.saveToken(response);

    expect(localStorage.getItem('userToken')).toBe(response.token);
  });
});
