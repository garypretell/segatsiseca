import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-sign-in',
  styleUrls: ['./sign-in.component.css'],
  templateUrl: './sign-in.component.html',
})
export class SignInComponent implements OnInit {
  public loginForm: FormGroup;
  miError = false;
  constructor(
    public auth: AuthService,
    public router: Router,
    public formBuilder: FormBuilder
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  private postSignIn(): void {
    this.router.navigate(['/Home']);
  }

  goAccount(): void {
    this.router.navigate(['account']);
  }

  async onLogin(): Promise<any> {
    try {
      const user = await this.auth.login(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
      if (user) {
        const isVerified = this.auth.isEmailVerified(user);
        this.redirectUser(isVerified);
      } else {
      }
    } catch (error: any) {
    }
  }

  private redirectUser(isVerified: boolean): void {
    if (isVerified) {
      this.router.navigate(['Home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }

  clearError(): void {
    this.miError = false;
  }

  resetPassword(): any {
    this.router.navigate(['/resetPassword']);
  }
}
