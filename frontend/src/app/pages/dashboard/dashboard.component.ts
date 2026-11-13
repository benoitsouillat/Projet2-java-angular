import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { UserService } from "../../core/service/user.service";
import { UserInfoDTO } from "../../core/DTO/userInfoDTO";
import { CommonModule } from "@angular/common";
import { MaterialModule } from "../../shared/material.module";
import {StudentService} from "../../core/service/student.service";
import {takeUntilDestroyed} from "@angular/core/rxjs-interop";

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, MaterialModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  private userService: UserService = inject(UserService);
  private studentService: StudentService = inject(StudentService);
  private formBuilder: FormBuilder = inject(FormBuilder);
  private destroyRef: DestroyRef = inject(DestroyRef);
  private token = 'Bearer ' + localStorage.getItem('userToken') || '';
  studentForm: FormGroup = new FormGroup({});
  students: UserInfoDTO[] = [];
  view: string = '';
  action: string = '';
  submitted: boolean = false;

  getListStudent() {
    this.view = 'list';
    this.userService.getListStudent(this.token)
        .subscribe({
            next: (response) => {
                this.students = response;
            },
          error: (error) => {
              alert('Erreur lors de la récupération de la liste des étudiants. Veuillez réessayer.');
          }
        });
  }

  addStudent() {
    this.view = 'form';
    this.action = 'add';
    this.studentForm = this.formBuilder.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        login: ['', [Validators.required, Validators.email]],
    });
  }

  editStudent(student: UserInfoDTO) {
    this.view = 'form';
    this.action = 'edit';
    this.studentForm = this.formBuilder.group({
        id: [student.id], // Comment ne pas passer l'id dans le formulaire mais le garder pour la requête de mise à jour ?
        firstName: [student.firstName, Validators.required],
        lastName: [student.lastName, Validators.required],
        login: [student.login, [Validators.required, Validators.email]],
    });
  }

  deleteStudent(studentId: number) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
        this.studentService.deleteStudent(studentId, this.token)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (response) => {
                    alert('Étudiant supprimé avec succès !');
                    this.getListStudent();
                },
                error: (error) => {
                    console.log(error);
                    switch (error.status){
                        case 400:
                            alert('[' + error.status + '] Requête invalide. Veuillez vérifier les informations saisies.');
                            break;
                        case 401:
                            alert('[' + error.status + '] Non autorisé. Veuillez vous reconnecter.');
                            break;
                        case 403:
                            alert('[' + error.status + '] Accès refusé. Vous n\'avez pas les permissions nécessaires.');
                            break;
                        case 404:
                            alert('[' + error.status + '] Ressource non trouvée -- Erreur de endpoint. Veuillez réessayer plus tard.');
                            break;
                        default:
                            alert('[' + error.status + '] Erreur lors de la suppression de l\'étudiant. Veuillez réessayer.');                            break;
                    }
                }
            });
    }
  }

  get form() {
      return this.studentForm.controls;
  }
  onSubmit() {
      this.submitted = true;
      if (this.studentForm.invalid) {
          alert('Veuillez remplir tous les champs requis correctement.');
          return;
      }
      const student = this.studentForm.value;
      const request$ = this.action === 'add'
          ? this.studentService.createStudent(student, this.token)
          : this.studentService.updateStudent(student, this.token);

      request$.pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
              next: (response) => {
                  alert('Action réussie !');
                  this.getListStudent();
              },
              error: (error) => {
                  console.error(error);
                  switch (error.status){
                        case 400:
                            alert('[' + error.status + '] Requête invalide. Veuillez vérifier les informations saisies.');
                            break;
                        case 401:
                            alert('[' + error.status + '] Non autorisé. Veuillez vous reconnecter.');
                            break;
                        case 403:
                            alert('[' + error.status + '] Accès refusé. Vous n\'avez pas les permissions nécessaires.');
                            break;
                        case 404:
                            alert('[' + error.status + '] Ressource non trouvée -- Erreur de endpoint. Veuillez réessayer plus tard.');
                            break;
                        default:
                            alert('[' + error.status + '] Erreur lors de l\'ajout de l\'étudiant. Veuillez réessayer.');                            break;
                  }
              }
          });
  }
  onReset(): void {
      this.submitted = false;
      this.studentForm.reset();
  }
}
