import {Component, DestroyRef, inject, OnInit} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserService } from '../../core/service/user.service';
import {loginUserDTO} from "../../core/DTO/loginUserDTO";
import {CommonModule} from "@angular/common";
import {MaterialModule} from "../../shared/material.module";


@Component({
  selector: 'app-login',
  imports: [CommonModule, MaterialModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private userService = inject(UserService);
  private formBuilder = inject(FormBuilder)
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;

  ngOnInit() {
    this.loginForm = this.formBuilder.group(
        {
          login: ['', Validators.required],
          password: ['', Validators.required]
        },
    );
  }

  get form() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }
    const loginUser: loginUserDTO = {
      login: this.loginForm.get('login')?.value || '',
      password: this.loginForm.get('password')?.value || ''
    };
    this.userService.login(loginUser)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (response) => {
            this.userService.saveToken(response);
            this.router.navigate(['/dashboard']);
          },
          error: (error) => {
            switch (error.status) {
                case 401:
                    alert('Identifiants invalides. Veuillez réessayer.');
                    break;
                case 404:
                    alert('Utilisateur non trouvé. Veuillez vérifier votre identifiant.');
                    break;
                default:
                    alert('An unexpected error occurred. Please try again later.');
                    break;
            }
          }
        }
        )
    ;
  }

  onReset(): void {
    this.submitted = false;
    this.loginForm.reset();
  }

}
