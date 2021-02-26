import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { AuthService } from 'src/app/auth/auth.service';
import firebase from 'firebase/app';
import Swal from 'sweetalert2';
import { map, takeUntil } from 'rxjs/operators';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-incidence-reporte',
  templateUrl: './incidence-reporte.component.html',
  styleUrls: ['./incidence-reporte.component.css'],
})
export class IncidenceReporteComponent implements OnInit, OnDestroy {
  @ViewChild('showModal') showModal: ElementRef;
  private unsubscribe$ = new Subject();
  incidenciatoEdit: any = {};
  incidences$: Observable<any>;
  tipoIncidencia$: Observable<any>;
  logIncidencia = [];
  imageObject = [];
  imageObject2 = [];
  finalizado: any;
  usuarioIncidencia: any;

  p = 1;

  miincidencia: any;
  limit = 5;
  estadoActual: any = 'REGISTRADO';
  fechaActual = true;
  nomFecha = 'Progreso Actual';
  max = new Date().toISOString().substring(0, 10);
  hoyF = new Date().toISOString().substring(0, 10);
  today = new Date().toISOString().substring(0, 10);
  desde = new Date().toISOString().substring(0, 10);
  hasta = new Date().toISOString().substring(0, 10);
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where(
            'fechaReg',
            '==',
            Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
          )
          .where('estado', '==', this.estadoActual)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
    this.tipoIncidencia$ = this.afs
      .collection('estado_incidencia', (ref) => ref.orderBy('estado', 'asc'))
      .valueChanges({ idField: 'id' });
  }

  ngOnDestroy(): void{
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  async detalles(item): Promise<any> {
    this.miincidencia = item;
    this.imageObject = [];
    this.imageObject2 = [];
    this.logIncidencia = [];
    const getLogs = await this.afs.firestore
      .collection('incidence_log')
      .where('incidencia', '==', item.id)
      .orderBy('createdAt', 'asc')
      .get();
    this.logIncidencia = getLogs.docs.map((doc) => doc.data());
    this.finalizado = item.finalizado;
    const getusuarioIncidencia = await this.afs.firestore
      .doc(`usuarios/${item.uid}`)
      .get();
    this.usuarioIncidencia = getusuarioIncidencia.data();
    const snapshot = await this.afs.firestore
      .collection('imagenes')
      .where('uploadId', '==', item.id)
      .where('finalizado', '==', false)
      .get();
    snapshot.docs
      .map((doc) => doc.data())
      .forEach((downlineItem) => {
        this.imageObject.push({
          image: downlineItem.path,
          thumbImage: downlineItem.path,
        });
      });
    const snapshot2 = await this.afs.firestore
      .collection('imagenes')
      .where('uploadId', '==', item.id)
      .where('finalizado', '==', true)
      .get();
    snapshot2.docs
      .map((doc) => doc.data())
      .forEach((downlineItem) => {
        this.imageObject2.push({
          image: downlineItem.path,
          thumbImage: downlineItem.path,
        });
      });
    jQuery(this.showModal.nativeElement).modal('show');
  }

  hoy(): any {
    this.p = 1;
    this.today = new Date().toISOString().substring(0, 10);
    this.nomFecha = 'Progreso Actual';
    this.fechaActual = true;
    return this.getFecha();
  }

  rango(): any {
    this.p = 1;
    this.nomFecha = 'Rango de Fechas';
    this.fechaActual = false;
    this.changeBetween();
  }

  changeActual(today): any {
    this.p = 1;
    const mifecha = Date.parse(today);
    this.getFecha();
  }

  getFecha(): any {
    this.desde = new Date().toISOString().substring(0, 10);
    this.hasta = new Date().toISOString().substring(0, 10);
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where(
            'fechaReg',
            '==',
            Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
          )
          .where('estado', '==', this.estadoActual)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges();
  }

  getBetween(desde, hasta): any {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('fechaReg', '>=', desde).where('fechaReg', '<=', hasta).where('estado', '==', this.estadoActual)
      )
      .valueChanges({ idField: 'id' });
  }

  changeBetween(): any {
    this.p = 1;
    const desde = Date.parse(this.desde);
    const hasta = Date.parse(this.hasta);
    this.getBetween(desde, hasta);
  }

  filterList(e): void {
    this.estadoActual = e.target.value;
    if (this.fechaActual) {
      this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where(
            'fechaReg',
            '==',
            Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
          )
          .where('estado', '==', this.estadoActual)
          .orderBy('createdAt', 'desc')
      )
      .valueChanges({ idField: 'id' });
    }else {
      this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('fechaReg', '>=', Date.parse(this.desde)).where('fechaReg', '<=', Date.parse(this.hasta))
        .where('estado', '==', this.estadoActual)
      )
      .valueChanges({ idField: 'id' });
    }
  }

  timeConverter(t): any{
    const a = new Date(t * 1000);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const year = a.getFullYear();
    const month = months[a.getMonth()];
    const date = a.getDate();
    const hour = a.getHours();
    const min = a.getMinutes();
    const sec = a.getSeconds();
    const time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
    return time;
  }

  async excel(): Promise<any> {
    const snapshot = await this.afs.firestore
      .collection('incidence')
      .where('fechaReg', '>=', Date.parse(this.desde)).where('fechaReg', '<=', Date.parse(this.hasta))
      .get();
    const data = snapshot.docs.map((doc) => {
      const datos: any = doc.data();
      const id = doc.id;
      const fecharegistro = (doc.data().createdAt).toDate();
      const final: any = { id, fecharegistro, ...datos };
      return final;
    });
    if (data.length > 0){
      Swal.fire({
        title: 'Exportar Reporte EXCEL?',
        text: 'No podrás revertir este proceso!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si!',
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
          this.auth.exportToExcel(data, 'reporte');
        }
      });
    }else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'No existen datos para exportar',
      });
    }
  }
}
