import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../auth.service';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  private unsubscribe$ = new Subject();
  collectionUsers;
  checkBoxValue: boolean;
  public accountForm: FormGroup;
  constructor(
    public router: Router,
    public afs: AngularFirestore,
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public formBuilder: FormBuilder
  ) {
    this.accountForm = this.formBuilder.group({
      displayName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      dni: [
        '',
        [
          Validators.required,
          Validators.min(10000000),
          Validators.max(99999999),
        ],
      ],
      telefono: [
        '',
        [
          Validators.required,
          Validators.min(100000000),
          Validators.max(999999999),
        ],
      ],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {}

  postSignIn(): void {
    this.router.navigate(['/Home']);
  }

  async onRegister(): Promise<any> {
    this.afs.firestore
      .doc(`usuarios/${this.accountForm.value.sede}`)
      .get()
      .then((docSnapshot: any) => {
        if (!docSnapshot.exists) {
          this.afs
            .collection(`usuarios`, (ref) =>
              ref.where('email', '==', this.accountForm.value.email)
            )
            .valueChanges({ idField: 'id' })
            .pipe(
              map(async (m) => {
                try {
                  const user = await this.auth.register(
                    this.accountForm.value);
                  if (user) {
                    const isVerified = this.auth.isEmailVerified(user);
                    this.redirectUser(isVerified);
                  }
                  return m[0];
                } catch (error) {
                  console.log('Error', error);
                }
              }), takeUntil(this.unsubscribe$)
            ).subscribe();
        } else {
          const user: any = docSnapshot.data();
          if (user.email === this.accountForm.value.email) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Este email ya ha sido registrado!',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Este DNI ya ha sido registrado!',
            });
          }
        }
      });
  }

  private redirectUser(isVerified: boolean): void {
    if (isVerified) {
      this.router.navigate(['Home']);
    } else {
      this.router.navigate(['verify-email']);
    }
  }
}
