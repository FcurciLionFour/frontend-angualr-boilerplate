import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthApi } from '../../../core/auth/auth.api';
import { AuthStore } from '../../../core/auth/auth.store';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  loading = signal(false);
  error = signal<string | null>(null);

  private fb = inject(FormBuilder)
  private authApi = inject(AuthApi)
  private authStore = inject(AuthStore)
  private router = inject(Router)

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });



  submit() {
    if (this.form.invalid) {
      this.error.set('Completá email y contraseña');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const { email, password } = this.form.getRawValue();


    this.authApi.login(email, password).subscribe({
      next: ({ accessToken }) => {
        this.authStore.setAccessToken(accessToken);
        this.authStore.finishInit();
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas');
      },
    });


  }

}
