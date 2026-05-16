import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 to-blue-600 px-4">
      <div class="max-w-md w-full bg-white rounded-lg shadow-2xl p-8">
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900 mb-2">Crear Cuenta</h1>
          <p class="text-gray-600">Únete a la quiniela del Mundial</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label for="full_name" class="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              id="full_name"
              type="text"
              formControlName="full_name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Juan Pérez"
            />
            @if (registerForm.get('full_name')?.invalid && registerForm.get('full_name')?.touched) {
              <p class="mt-1 text-sm text-red-600">El nombre es requerido</p>
            }
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-2">
              Nombre de usuario
            </label>
            <input
              id="username"
              type="text"
              formControlName="username"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="juanperez"
            />
            @if (registerForm.get('username')?.invalid && registerForm.get('username')?.touched) {
              <p class="mt-1 text-sm text-red-600">El nombre de usuario es requerido (mín. 3 caracteres)</p>
            }
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="tu@email.com"
            />
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <p class="mt-1 text-sm text-red-600">Ingresa un correo válido</p>
            }
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <p class="mt-1 text-sm text-red-600">La contraseña debe tener al menos 6 caracteres</p>
            }
          </div>

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmPassword"
              type="password"
              formControlName="confirmPassword"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="••••••••"
            />
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('confirmPassword')?.touched) {
              <p class="mt-1 text-sm text-red-600">Las contraseñas no coinciden</p>
            }
          </div>

          @if (errorMessage) {
            <div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {{ errorMessage }}
            </div>
          }

          @if (successMessage) {
            <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {{ successMessage }}
            </div>
          }

          <button
            type="submit"
            [disabled]="registerForm.invalid || loading"
            class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            @if (loading) {
              <span>Creando cuenta...</span>
            } @else {
              <span>Registrarse</span>
            }
          </button>
        </form>

        <div class="mt-6 text-center">
          <p class="text-gray-600">
            ¿Ya tienes cuenta?
            <a routerLink="/login" class="text-green-600 hover:text-green-700 font-semibold">
              Inicia sesión aquí
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      full_name: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) return;

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { confirmPassword, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Cuenta creada exitosamente. Tu acceso quedará pendiente de autorización por un administrador.';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.message || 'Error al crear la cuenta. Intenta de nuevo.';
      }
    });
  }
}

// Made with Bob