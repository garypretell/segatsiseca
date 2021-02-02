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
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-incidence-area',
  templateUrl: './incidence-area.component.html',
  styleUrls: ['./incidence-area.component.css'],
})
export class IncidenceAreaComponent implements OnInit, OnDestroy {
  @ViewChild('editModal') editModal: ElementRef;
  @ViewChild('showModal') showModal: ElementRef;
  private unsubscribe$ = new Subject();
  incidenciatoEdit: any = {};
  incidences$: Observable<any>;
  tipoIncidencia$: Observable<any>;
  areas$: Observable<any>;
  data: any;
  tipoIncidencia: any = [];
  imagenes: any = [];
  imageObject = [];
  area: any;
  p = 1;

  latitude: number;
  longitude: number;
  zoom: number;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) {}

  async ngOnInit(): Promise<void> {
    const { uid } = await this.auth.getUser();
    const snapshot2 = await this.afs.firestore
      .collection('estado_incidencia')
      .where('estado', '>', 1)
      .get();
    this.tipoIncidencia = snapshot2.docs.map((doc) => doc.data());

    const snapshot = await this.afs.firestore.doc(`usuarios/${uid}`).get();
    this.data = snapshot.data();
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where('estado', '==', 'ASIGNADA')
          .where('area', '==', this.data.area)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
    this.areas$ = this.afs.collection('areas').valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  filterList(e): void {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where('estado', '==', e.target.value)
          .where('area', '==', this.data.area)
          .orderBy('createdAt', 'desc')
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

  cambiarestado(estado): void {
    const filtro = this.tipoIncidencia.find((f) => f.descripcion === estado);
    const estadoActualizar = this.tipoIncidencia.find(
      (f) => f.estado === +filtro.estado + 1
    );
    console.log(estadoActualizar.descripcion);
    if (estadoActualizar) {
      Swal.fire({
        title: 'Esta seguro?',
        text: 'No podrá revertir este proceso!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Actualizar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.afs
            .doc(`incidence/${this.incidenciatoEdit.id}`)
            .set({ estado: estadoActualizar.descripcion }, { merge: true });
          Swal.fire('Actualizado!', 'Incidencia actualizada.', 'success');
        }
      });
    }else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Esta incidencia no puede ser actualizada!',
      });
    }
  }

  asignar(): void {}

  async detalles(item): Promise<void> {
    const snapshot = await this.afs.firestore
      .collection('imagenes')
      .where('uploadId', '==', item.id)
      .get();
    this.imagenes = snapshot.docs.map((doc) => doc.data());
    this.imagenes.forEach((downlineItem) => {
      this.imageObject.push({
        image: downlineItem.path,
        thumbImage: downlineItem.path
      });
    });
    this.latitude = item.latitud;
    this.longitude = item.longitud;
    this.zoom = 12;
    jQuery(this.showModal.nativeElement).modal('show');
  }
}
