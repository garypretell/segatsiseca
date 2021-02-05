import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  ɵConsole,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
import firebase from 'firebase/app';
import Swal from 'sweetalert2';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-incidence-listado',
  templateUrl: './incidence-listado.component.html',
  styleUrls: ['./incidence-listado.component.css'],
})
export class IncidenceListadoComponent implements OnInit, OnDestroy {
  @ViewChild('editModal') editModal: ElementRef;
  private unsubscribe$ = new Subject();
  incidenciatoEdit: any = {};
  incidences$: Observable<any>;
  estadoActual: any = 'REGISTRADO';
  areas$: Observable<any>;
  area: any = null;
  tipoIncidencia$: Observable<any>;
  p = 1;

  tableData: any[] = [];

  firstInResponse: any = [];

  lastInResponse: any = [];

  prev_strt_at: any = [];

  pagination_clicked_count = 0;

  disable_next = false;
  disable_prev = false;
  limit = 5;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // this.incidences$ = this.afs
    //   .collection('incidence', (ref) =>
    //     ref.where('estado', '==', 'REGISTRADO').orderBy('createdAt', 'desc')
    //   )
    //   .valueChanges({ idField: 'id' });
    this.loadItems(this.estadoActual);
    this.tipoIncidencia$ = this.afs
      .collection('estado_incidencia', (ref) => ref.orderBy('estado', 'asc'))
      .valueChanges({ idField: 'id' });

    this.areas$ = this.afs.collection('areas').valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  loadItems(estado): any {
    this.afs
      .collection('incidence', (ref) =>
        ref.where('estado', '==', estado).limit(this.limit).orderBy('createdAt', 'desc')
      )
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
      .collection('incidence', (ref) =>
        ref
          .where('estado', '==', this.estadoActual)
          .orderBy('createdAt', 'desc')
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
      .collection('incidence', (ref) =>
        ref
          .where('estado', '==', this.estadoActual)
          .limit(this.limit)
          .orderBy('createdAt', 'desc')
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

  filterList(e): void {
    this.tableData = [];
    this.estadoActual = e.target.value;
    this.loadItems(this.estadoActual);
  }

  editIncidencia(incidencia): void {
    this.afs.firestore
      .doc(`incidence/${incidencia.id}`)
      .get()
      .then((docSnapshot) => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este Libro no ha sido registrado!',
          });
        } else {
          this.incidenciatoEdit = docSnapshot.data();
          this.incidenciatoEdit.id = incidencia.id;
          jQuery(this.editModal.nativeElement).modal('show');
        }
      });
  }

  async asignar(): Promise<void> {
    const { uid } = await this.auth.getUser();
    const log: any = {
      incidencia: this.incidenciatoEdit.id,
      fecha: Date.now(),
      createdAt: firebase.firestore.Timestamp.now().toDate(),
      usuario: uid,
      descripcion: 'Incidencia asignada',
    };
    this.afs.collection('incidence_log').add(log);
    this.afs
      .doc(`incidence/${this.incidenciatoEdit.id}`)
      .set(
        { area: $('#area option:selected').html(), estado: 'ASIGNADA' },
        { merge: true }
      );
    jQuery(this.editModal.nativeElement).modal('hide');
  }
}
