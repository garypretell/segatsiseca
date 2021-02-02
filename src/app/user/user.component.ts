import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/auth.service';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
})
export class UserComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  @ViewChild('editModal') editModal: ElementRef;
  usuariotoEdit: any = {};
  usuarios$: Observable<any>;
  searchObject: any = {};

  arrayTemp: any;
  idx: any;
  campotoEditS: any = {};

  subscriber: any;
  editor: any;
  admin: any;
  super: any;
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.usuarios$ = this.afs
      .collection('usuarios')
      .valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  editUsuario(usuario): void {
    this.afs.firestore
      .doc(`usuarios/${usuario.uid}`)
      .get()
      .then((docSnapshot) => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este usuario no ha sido registrado!',
          });
        } else {
          const user = docSnapshot.data();
          this.usuariotoEdit = usuario.uid;
          this.subscriber = true;
          this.editor = user.roles.editor;
          this.admin = user.roles.admin;
          this.super = user.roles.super;

          jQuery(this.editModal.nativeElement).modal('show');
        }
      });
    jQuery(this.editModal.nativeElement).modal('show');
  }

  deleteUsusario(usuario): void {
    Swal.fire({
      title: 'Are you sure to delete this user?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, Delete!',
    }).then((result) => {
      if (result.value) {
        this.afs.doc(`usuarios/${usuario.uid}`).delete();
        Swal.fire('Deleted!', 'User has been deleted.', 'success');
      }
    });
  }

  goReporte(user): void {}

  goHome(): void {
    this.router.navigate(['/Home']);
  }

  async updateUsuario(): Promise<void> {
    const roles: any = {
      roles: {
        admin: this.admin,
        editor: this.editor,
        subscriber: this.subscriber,
        super: this.super,
      },
    };
    await this.afs
      .doc(`usuarios/${this.usuariotoEdit}`)
      .set(roles, { merge: true });
    jQuery(this.editModal.nativeElement).modal('hide');
  }
}
