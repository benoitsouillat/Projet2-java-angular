import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { UserService } from '../../core/service/user.service';
import { StudentService } from '../../core/service/student.service';
import { UserInfoDTO } from '../../core/DTO/userInfoDTO';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let userService: UserService;
  let studentService: StudentService;

  // Données de test
  const student: UserInfoDTO = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    login: 'john@doe.fr',
    token: '',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  };

  beforeEach(async () => {
    // Le composant lit le token à sa création : on le range AVANT createComponent
    localStorage.setItem('userToken', 'fake-token');

    // alert() et confirm() ne fonctionnent pas dans les tests : on les remplace par de fausses fonctions
    window.alert = jest.fn();
    window.confirm = jest.fn().mockReturnValue(true); // l'utilisateur clique sur OK

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        // Faux UserService : renvoie une liste avec un étudiant
        {
          provide: UserService,
          useValue: {
            getListStudent: jest.fn().mockReturnValue(of([student]))
          }
        },
        // Faux StudentService : chaque méthode répond un succès.
        // of({}) et pas of() : il faut émettre une valeur pour que le code de succès s'exécute
        {
          provide: StudentService,
          useValue: {
            createStudent: jest.fn().mockReturnValue(of({})),
            updateStudent: jest.fn().mockReturnValue(of({})),
            deleteStudent: jest.fn().mockReturnValue(of({}))
          }
        }
      ]
    })
    .compileComponents();

    // On récupère les faux que le composant a reçus, pour les vérifier dans les tests
    userService = TestBed.inject(UserService);
    studentService = TestBed.inject(StudentService);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getListStudent()', () => {
    it('should load the students and show the list', () => {
      // Act
      component.getListStudent();

      // Assert
      expect(userService.getListStudent).toHaveBeenCalledWith('Bearer fake-token');
      expect(component.students).toEqual([student]);
      expect(component.view).toBe('list');
    });
  });

  describe('addStudent()', () => {
    it('should show an empty form in add mode', () => {
      // Act
      component.addStudent();

      // Assert
      expect(component.view).toBe('form');
      expect(component.action).toBe('add');
      expect(component.studentForm.value).toEqual({ firstName: '', lastName: '', login: '' });
    });
  });

  describe('editStudent()', () => {
    it('should show the form filled with the student in edit mode', () => {
      // Act
      component.editStudent(student);

      // Assert
      expect(component.view).toBe('form');
      expect(component.action).toBe('edit');
      expect(component.studentForm.value).toEqual({ id: 1, firstName: 'John', lastName: 'Doe', login: 'john@doe.fr' });
    });
  });

  describe('onSubmit()', () => {
    it('should create the student and reload the list in add mode', () => {
      // Arrange : on ouvre le formulaire d'ajout et on le remplit
      const newStudent = { firstName: 'Jane', lastName: 'Smith', login: 'jane@smith.fr' };
      component.addStudent();
      component.studentForm.setValue(newStudent);

      // Act
      component.onSubmit();

      // Assert
      expect(studentService.createStudent).toHaveBeenCalledWith(newStudent, 'Bearer fake-token');
      expect(userService.getListStudent).toHaveBeenCalled(); // la liste est rechargée
    });

    it('should update the student in edit mode', () => {
      // Arrange : on ouvre le formulaire d'édition (déjà rempli avec John)
      component.editStudent(student);

      // Act
      component.onSubmit();

      // Assert
      expect(studentService.updateStudent).toHaveBeenCalledWith(
        { id: 1, firstName: 'John', lastName: 'Doe', login: 'john@doe.fr' },
        'Bearer fake-token'
      );
    });
  });

  describe('deleteStudent()', () => {
    it('should delete the student and reload the list when the user confirms', () => {
      // Act
      component.deleteStudent(1);

      // Assert
      expect(studentService.deleteStudent).toHaveBeenCalledWith(1, 'Bearer fake-token');
      expect(userService.getListStudent).toHaveBeenCalled(); // la liste est rechargée
    });

    it('should not delete anything when the user cancels', () => {
      // Arrange : cette fois, l'utilisateur clique sur Annuler
      window.confirm = jest.fn().mockReturnValue(false);

      // Act
      component.deleteStudent(1);

      // Assert
      expect(studentService.deleteStudent).not.toHaveBeenCalled();
    });
  });
});
