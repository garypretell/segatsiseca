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
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';
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
  areas$: Observable<any>;
  area: any;
  tipoIncidencia$: Observable<any>;
  p = 1;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('estado', '==', 'REGISTRADO').orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
    this.tipoIncidencia$ = this.afs
      .collection('estado_incidencia', (ref) => ref.orderBy('estado', 'asc'))
      .valueChanges({ idField: 'id' });

    this.areas$ = this.afs
      .collection('areas')
      .valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  filterList(e): void {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('estado', '==', e.target.value).orderBy('createdAt', 'desc')
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

  asignar(): void {
    this.afs
      .doc(`incidence/${this.incidenciatoEdit.id}`)
      .set({area: this.area, estado : 'ASIGNADA' }, { merge: true });
    jQuery(this.editModal.nativeElement).modal('hide');
  }

}
