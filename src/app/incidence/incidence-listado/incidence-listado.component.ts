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


  limit = 5;

  selectedDay: string = '';
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('estado', '==', this.estadoActual).limit(this.limit).orderBy('createdAt', 'asc')
      )
      .valueChanges({ idField: 'id' });
    this.tipoIncidencia$ = this.afs
      .collection('estado_incidencia', (ref) => ref.orderBy('estado', 'asc'))
      .valueChanges({ idField: 'id' });

    this.areas$ = this.afs.collection('areas').valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  selectChangeHandler (event: any) {
    this.selectedDay = event.target.value;
  }



  filterList(e): void {
    this.estadoActual = e.target.value;
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('estado', '==', this.estadoActual).orderBy('createdAt', 'asc')
      )
      .valueChanges({ idField: 'id' });
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
        { area: this.selectedDay, estado: 'ASIGNADA' },
        { merge: true }
      );
    jQuery(this.editModal.nativeElement).modal('hide');
  }
}
