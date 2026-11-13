import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { NavigationComponent } from './navigation.component';
import { UserService } from '../../core/service/user.service';

describe('NavigationComponent', () => {
  let component: NavigationComponent;
  let fixture: ComponentFixture<NavigationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavigationComponent],
      providers: [
        // Faux UserService : l'utilisateur n'est pas connecté
        {
          provide: UserService,
          useValue: {
            isAuthenticated$: of(false),
            logout: jest.fn()
          }
        },
        // Les routerLink du template ont besoin du routeur : on en fournit un, sans routes
        provideRouter([])
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
