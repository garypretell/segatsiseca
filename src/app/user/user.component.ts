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

  tableData: any[] = [];

  firstInResponse: any = [];

  lastInResponse: any = [];

  prev_strt_at: any = [];

  pagination_clicked_count = 0;

  disable_next = false;
  disable_prev = false;
  limit = 4;
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.loadItems();
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

  loadItems(): any {
    this.afs
      .collection('usuarios', ref => ref.limit(this.limit))
      .snapshotChanges()
      .subscribe(
        (response) => {
          if (!response.length) {
            console.log('No Data Available');
            return false;
          }
          this.firstInResponse = response[0].payload.doc;
          this.lastInResponse = response[response.length - 1].payload.doc;

          this.tableData = [];
          for (const item of response) {
            const data: any = item.payload.doc.data();
            const id = item.payload.doc.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.prev_strt_at = [];
          this.pagination_clicked_count = 0;
          this.disable_next = false;
          this.disable_prev = false;

          this.push_prev_startAt(this.firstInResponse);
        },
        (error) => {}
      );
  }

  prevPage(): any {
    this.disable_prev = true;
    this.afs
      .collection('usuarios', (ref) =>
        ref
          .startAt(this.get_prev_startAt())
          .endBefore(this.firstInResponse)
          .limit(this.limit)
      )
      .get()
      .subscribe(
        (response) => {
          this.firstInResponse = response.docs[0];
          this.lastInResponse = response.docs[response.docs.length - 1];

          this.tableData = [];
          for (const item of response.docs) {
            const data: any = item.data();
            const id = item.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.pagination_clicked_count--;

          this.pop_prev_startAt(this.firstInResponse);

          this.disable_prev = false;
          this.disable_next = false;
        },
        (error) => {
          this.disable_prev = false;
        }
      );
  }

  nextPage(): any {
    this.disable_next = true;
    this.afs
      .collection('usuarios', (ref) =>
        ref
          .startAfter(this.lastInResponse)
      )
      .get()
      .subscribe(
        (response) => {
          if (!response.docs.length) {
            this.disable_next = true;
            return;
          }

          this.firstInResponse = response.docs[0];

          this.lastInResponse = response.docs[response.docs.length - 1];
          this.tableData = [];
          for (const item of response.docs) {
            const data: any = item.data();
            const id = item.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.pagination_clicked_count++;

          this.push_prev_startAt(this.firstInResponse);

          this.disable_next = false;
        },
        (error) => {
          this.disable_next = false;
        }
      );
  }

  push_prev_startAt(prev_first_doc): any {
    this.prev_strt_at.push(prev_first_doc);
  }

  pop_prev_startAt(prev_first_doc): any {
    this.prev_strt_at.forEach((element) => {
      if (prev_first_doc.data().id === element.data().id) {
        element = null;
      }
    });
  }

  get_prev_startAt(): any {
    if (this.prev_strt_at.length > this.pagination_clicked_count + 1) {
      this.prev_strt_at.splice(
        this.prev_strt_at.length - 2,
        this.prev_strt_at.length - 1
      );
    }
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }

  readableDate(time): any {
    const d = new Date(time);
    return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
  }
}
