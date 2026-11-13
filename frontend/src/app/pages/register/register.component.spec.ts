import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { RegisterComponent } from './register.component';
import { UserService } from '../../core/service/user.service';
import { Register } from '../../core/models/Register';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let userService: UserService;
  let router: Router;

  // Données de test
  const register: Register = {
    firstName: 'John',
    lastName: 'Doe',
    login: 'john@doe.fr',
    password: 'password123'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        // Faux UserService : register() répond un succès.
        // of({}) est un vrai Observable : il a .pipe() et .subscribe(), et il émet une valeur
        { provide: UserService, useValue: { register: jest.fn().mockReturnValue(of({})) } },
        // Faux Router : navigate() ne navigue pas, il retient juste ses appels
        { provide: Router, useValue: { navigate: jest.fn() } }
      ]
    })
    .compileComponents();

    // On récupère les faux que le composant a reçus, pour les vérifier dans les tests
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with firstName, lastName, login, and password controls', () => {
    expect(component.registerForm.contains('firstName')).toBe(true);
    expect(component.registerForm.contains('lastName')).toBe(true);
    expect(component.registerForm.contains('login')).toBe(true);
    expect(component.registerForm.contains('password')).toBe(true);
  });

  it('should register the user and redirect to /login when the form is valid', () => {
    // Arrange
    window.confirm = jest.fn(); // confirm() ne fonctionne pas dans les tests : on le remplace
    component.registerForm.setValue(register);

    // Act
    component.onSubmit();

    // Assert
    expect(userService.register).toHaveBeenCalledWith(register);
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });
});
