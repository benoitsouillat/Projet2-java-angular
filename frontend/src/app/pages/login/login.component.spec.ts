import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { LoginComponent } from './login.component';
import { UserService } from '../../core/service/user.service';
import { loginUserDTO } from '../../core/DTO/loginUserDTO';
import { loginResponseDTO } from '../../core/DTO/loginResponseDTO';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let userService: UserService;
  let router: Router;

  // Données de test
  const loginUser: loginUserDTO = { login: 'testuser', password: 'testpassword' };
  const loginResponse: loginResponseDTO = { code: 200, login: 'testuser', message: 'OK', token: 'mocked-jwt-token' };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        // Faux UserService : jest.fn() crée une fausse fonction qui retient ses appels
        {
          provide: UserService,
          useValue: {
            login: jest.fn().mockReturnValue(of(loginResponse)), // login() répond loginResponse
            saveToken: jest.fn()                                   // saveToken() ne fait rien
          }
        },
        // Faux Router : navigate() ne navigue pas, il retient juste ses appels
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    })
    .compileComponents();

    // On récupère les faux que le composant a reçus, pour les vérifier dans les tests
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // lance ngOnInit(), qui crée le formulaire
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not call the service when the form is invalid', () => {
    // Act : on valide le formulaire vide
    component.onSubmit();

    // Assert
    expect(userService.login).not.toHaveBeenCalled();
  });

  it('should log in and redirect to /dashboard when the form is valid', () => {
    // Arrange
    component.loginForm.setValue(loginUser);

    // Act
    component.onSubmit();

    // Assert
    expect(userService.login).toHaveBeenCalledWith(loginUser);
    expect(userService.saveToken).toHaveBeenCalledWith(loginResponse);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should clear the form when reset', () => {
    // Arrange
    component.loginForm.setValue(loginUser);
    component.submitted = true;

    // Act
    component.onReset();

    // Assert
    expect(component.submitted).toBe(false);
    expect(component.loginForm.value).toEqual({ login: null, password: null });
  });
});
