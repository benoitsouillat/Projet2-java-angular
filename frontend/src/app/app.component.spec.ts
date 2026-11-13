import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AppComponent } from './app.component';
import { UserService } from './core/service/user.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        // Faux UserService, partagé par AppComponent et ses composants enfants
        {
          provide: UserService,
          useValue: {
            loadCurrentUser: jest.fn(),   // appelé par AppComponent à sa création
            isAuthenticated$: of(false),  // lu par NavigationComponent
            currentUser$: of(null)        // lu par DebugComponent
          }
        },
        // <router-outlet> et les routerLink de la navigation ont besoin du routeur
        provideRouter([])
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'etudiant-frontend' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('etudiant-frontend');
  });
});
