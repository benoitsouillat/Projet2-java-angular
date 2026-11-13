import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DebugComponent } from './debug.component';
import { UserService } from '../core/service/user.service';

describe('DebugComponent', () => {
  let component: DebugComponent;
  let fixture: ComponentFixture<DebugComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DebugComponent],
      providers: [
        // Faux UserService : aucun utilisateur connecté
        { provide: UserService, useValue: { currentUser$: of(null) } }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DebugComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
