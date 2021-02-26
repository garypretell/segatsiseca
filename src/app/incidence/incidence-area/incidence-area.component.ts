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
import firebase from 'firebase/app';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/storage';
import { finalize, tap } from 'rxjs/operators';
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
  @ViewChild('showUpload') showUpload: ElementRef;
  @ViewChild('asignModal') asignModal: ElementRef;
  selectedFiles: FileList;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  incidenciaId: any;
  visible: boolean;
  progressInfos = [];
  message = '';
  private unsubscribe$ = new Subject();
  incidenciatoEdit: any = {};
  incidences$: Observable<any>;
  tipoIncidencia$: Observable<any>;
  areas$: Observable<any>;
  data: any;
  incidencia: any;
  tipoIncidencia: any = [];
  estadoActual: any = 'ASIGNADA';
  miestado: any = 'ASIGNAR';
  imagenes: any = [];
  imagenes2: any = [];
  imageObject = [];
  logIncidencia = [];
  imageObject2 = [];
  area: any;
  hoy = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 1)).toISOString().substring(0, 10);
  hasta = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 1)).toISOString().substring(0, 10);
  p = 1;

  miincidencia: any;
  selectedDay = '';

  finalizado: any;
  latitude: number;
  longitude: number;
  zoom: number;

  limit = 5;
  fechaActual = true;
  nomFecha = 'Progreso Actual';
  max = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
  hoyF = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
  today = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
  desde = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
  hastaF = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
  usuariosDisponibles$: Observable<any>;
  usuarioDisponible: any;
  public uploadForm: FormGroup;
  usuarioIncidencia: any;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private storage: AngularFireStorage,
    public formBuilder: FormBuilder,
    private activatedroute: ActivatedRoute
  ) {
    this.uploadForm = this.formBuilder.group({
      observacion: ['', [Validators.required]],
    });
  }

  async ngOnInit(): Promise<void> {
    const { uid } = await this.auth.getUser();
    const snapshot2 = await this.afs.firestore
      .collection('estado_incidencia')
      .where('estado', '>', 1)
      .get();
    this.tipoIncidencia = snapshot2.docs.map((doc) => doc.data());
    const snapshot = await this.afs.firestore.doc(`usuarios/${uid}`).get();
    this.data = snapshot.data();
    this.areas$ = this.afs.collection('areas').valueChanges({ idField: 'id' });
    this.incidences$ = this.afs.collection('incidence', (ref) => ref.where('estado', '==', this.estadoActual)
    .where('area', '==', this.data.area).where(
      'fechaReg',
      '==',
      Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
    ).orderBy('createdAt', 'asc')
      ).valueChanges({ idField: 'id' }).pipe(tap(arr => console.log(`read ${arr.length} docs`)));
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  sumarDias(fecha, dias): any{
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }

  selectChangeHandler(event: any): any {
    this.selectedDay = event.target.value;
  }

  filterList(e): void {
    this.estadoActual = e.target.value;
    if (this.fechaActual) {
      this.incidences$ = this.afs.collection('incidence', (ref) => ref.where('estado', '==', this.estadoActual)
    .where('area', '==', this.data.area).where(
      'fechaReg',
      '==',
      Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
    ).orderBy('createdAt', 'asc')
      ).valueChanges({ idField: 'id' });
    }else {
      this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('fechaReg', '>=', Date.parse(this.desde)).where('fechaReg', '<=', Date.parse(this.hastaF))
        .where('estado', '==', this.estadoActual)
        .where('area', '==', this.data.area)
      )
      .valueChanges({ idField: 'id' }).pipe(tap(arr => console.log(`read ${arr.length} docs`)));
    }
  }

  filterLista(e): void {
    this.miestado = e.target.value;
  }

  editIncidencia(incidencia): void {
    if (incidencia.estado === 'ASIGNADA') {
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
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'La incidencia está siendo atendida!',
      });
    }
  }

  asignarModal(item): any {
    this.incidencia = item;
    if (item.estado === 'ASIGNADA' || item.estado === 'PROGRAMADA' ) {
      this.usuariosDisponibles$ = this.afs
        .collection('usuarios', (ref) =>
          ref
            .where('tipousuario', '==', 'SUPERVISOR')
          //  .where('disponible', '==', true)
        )
        .valueChanges({ idField: 'id' });
      jQuery(this.asignModal.nativeElement).modal('show');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Esta incidencia no puede ser actualizada!',
      });
    }
  }

  changeReprogramar(): void {

  }

  async cambiarestado(): Promise<void> {
    // console.log(new Date(this.hasta).toISOString().substring(0, 10));
    // console.log( Date.parse(this.hasta));
    const item: any = this.incidencia;
    this.incidenciaId = item.id;
    const { uid } = await this.auth.getUser();
    const estadoNext = this.estado(item.estado);
    if (this.miestado === 'ASIGNAR') {
      if (this.usuarioDisponible) {
        const log: any = {
          supervisor: this.usuarioDisponible,
          incidencia: item.id,
          fecha: Date.now(),
          createdAt: firebase.firestore.Timestamp.now().toDate(),
          usuario: uid,
          descripcion: `Incidencia ${estadoNext}`,
        };
        this.afs.collection('incidence_log').add(log);
        this.afs
          .doc(`incidence/${item.id}`)
          .set(
            { estado: estadoNext, supervisor: this.usuarioDisponible },
            { merge: true }
          );
        Swal.fire('Actualizado!', 'Incidencia actualizada.', 'success');
        jQuery(this.asignModal.nativeElement).modal('hide');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Seleccione supervisor!',
        });
      }
    } else {
      const log: any = {
        incidencia: item.id,
        fecha: Date.now(),
        createdAt: firebase.firestore.Timestamp.now().toDate(),
        usuario: uid,
        descripcion: `Incidencia PROGRAMADA`,
      };
      this.afs.collection('incidence_log').add(log);
      this.afs
        .doc(`incidence/${item.id}`)
        .set({ estado: 'PROGRAMADA', createdProgramada:
        Date.parse(this.hasta), fechaprogramada: new Date(this.hasta).toISOString().substring(0, 10) }, { merge: true });
      Swal.fire('Reprogramada!', 'Incidencia Reprogramada.', 'success');
      jQuery(this.asignModal.nativeElement).modal('hide');
    }
  }

  estado(e): string {
    switch (e) {
      case 'ASIGNADA':
        return 'EN ATENCIÓN';
      case 'EN ATENCIÓN':
        return 'CONCLUÍDA';
      case 'CONCLUÍDA':
        return null;
      default:
        console.log('Estado de incidencia, no registrada');
    }
  }

  async asignar(): Promise<void> {
    const { uid } = await this.auth.getUser();
    const log: any = {
      incidencia: this.incidenciatoEdit.id,
      fecha: Date.now(),
      createdAt: firebase.firestore.Timestamp.now().toDate(),
      usuario: uid,
      descripcion: 'Incidencia Reasignada',
    };
    this.afs.collection('incidence_log').add(log);
    this.afs
      .doc(`incidence/${this.incidenciatoEdit.id}`)
      .set({ area: this.selectedDay }, { merge: true });
  }

  async detalles(item): Promise<void> {
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
    this.imagenes = snapshot.docs.map((doc) => doc.data());
    this.imagenes.forEach((downlineItem) => {
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
    this.imagenes2 = snapshot2.docs.map((doc) => doc.data());
    this.imagenes2.forEach((downlineItem) => {
      this.imageObject2.push({
        image: downlineItem.path,
        thumbImage: downlineItem.path,
      });
    });
    this.latitude = item.latitud;
    this.longitude = item.longitud;
    this.zoom = 12;
    jQuery(this.showModal.nativeElement).modal('show');
  }

  selectFiles(event): any {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  async uploadFiles(): Promise<any> {
    const { uid } = await this.auth.getUser();
    if (this.uploadForm.value.observacion) {
      this.visible = true;
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i], this.incidenciaId, uid);
      }
      const log: any = {
        incidencia: this.incidenciaId,
        fecha: Date.now(),
        createdAt: firebase.firestore.Timestamp.now().toDate(),
        usuario: uid,
        descripcion: 'Incidencia Cerrada',
      };
      this.afs.collection('incidence_log').add(log);
      this.afs.doc(`incidence/${this.incidenciaId}`).set(
        {
          estado: 'CONCLUÍDA',
          finalizado: true,
          observacion: this.uploadForm.value.observacion,
        },
        { merge: true }
      );
      jQuery(this.showUpload.nativeElement).modal('hide');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese Observacion!',
      });
    }
  }

  async upload(idx, file, uploadId, uid): Promise<any> {
    const filePath = `${uid}/${uploadId}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
    this.uploadPercent = task.percentageChanges();
    this.progressInfos[idx] = { value: 0, fileName: file.name };
    task
      .snapshotChanges()
      .pipe(
        finalize(async () => {
          this.downloadURL = await fileRef.getDownloadURL().toPromise();
          const imagenes: any = {
            path: this.downloadURL,
            uploadId,
            name: file.name,
            estado: false,
            fechaReg: Date.now(),
            createdAt: firebase.firestore.Timestamp.now().toDate(),
            uid,
            finalizado: true,
          };
          this.afs.collection('imagenes').add(imagenes);
        })
      )
      .subscribe();
  }

  print(): void {
    let printContents;
    let popupWin;
    printContents = document.getElementById('print-section').innerHTML;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin.document.open();
    popupWin.document.write(`
    <html>
      <head>
        <title>Incidencia</title>
        <link rel="stylesheet preload" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous">
        <style>
        .myslider {
          width: 200;
          height: 150;
      }
      myslider {
        width: 200;
        height: 150;
    }
        * {
          font-size: 0.93rem;
        }
        @media print{
          @page {size: portrait}
          .printTD{
          display: inherit;
          }
          .myslider {
            width: 200;
            height: 150;
        }
          thead {
          display: table-row-group
          }
          td{
          overflow-wrap: break-word;
          word-break: break-word;
          }
          }
        </style>
      </head>
  <body onload="window.print();window.close()">${printContents}
  <script src="https://code.jquery.com/jquery-3.4.1.slim.min.js" integrity="sha384-J6qa4849blE2+poT4WnyKhv5vZF5SrPo0iEjwBvKU7imGFAV0wwj1yYfoRSJoZ+n" crossorigin="anonymous"></script>
  <script src="https://cdn.jsdelivr.net/npm/popper.js@1.16.0/dist/umd/popper.min.js" integrity="sha384-Q6E9RHvbIyZFJoft+2mJbHaEWldlvI9IOYy5n3zV9zzTtmI3UksdQRVvoxMfooAo" crossorigin="anonymous"></script>
  <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/js/bootstrap.min.js" integrity="sha384-wfSDF2E50Y2D1uUdj0O3uMBJnjuUD4Ih7YwaYd1iqfktj0Uod8GCExl3Og8ifwB6" crossorigin="anonymous"></script>
  </body>
    </html>`);
    popupWin.document.close();
  }

  hoyB(): any {
    this.p = 1;
    this.today = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
    this.nomFecha = 'Progreso Actual';
    this.fechaActual = true;
    return this.getFecha();
  }

  getFecha(): any {
    this.desde = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
    this.hastaF = new Date(this.sumarDias( firebase.firestore.Timestamp.now().toDate(), 0)).toISOString().substring(0, 10);
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref
          .where('area', '==', this.data.area)
          .where(
            'fechaReg',
            '==',
            Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10))
          )
          .where('estado', '==', this.estadoActual)
          .orderBy('createdAt', 'asc')
      )
      .valueChanges({ idField: 'id' }).pipe(tap(arr => console.log(`read ${arr.length} docs`)));

  }

  rangoB(): any {
    this.p = 1;
    this.nomFecha = 'Rango de Fechas';
    this.fechaActual = false;
    this.changeBetween();
  }

  changeBetween(): any{
    this.p = 1;
    const desde = Date.parse(this.desde);
    const hasta = Date.parse(this.hastaF);
    this.getBetween(desde, hasta);
  }

  getBetween(desde, hasta): any {
    this.incidences$ = this.afs
      .collection('incidence', (ref) =>
        ref.where('fechaReg', '>=', desde).where('fechaReg', '<=', hasta).where('estado', '==', this.estadoActual)
        .where('area', '==', this.data.area)
        .where('estado', '==', this.estadoActual)
      )
      .valueChanges({ idField: 'id' }).pipe(tap(arr => console.log(`read ${arr.length} docs`)));
  }

  changeActual(today): any {
    this.p = 1;
    const mifecha = Date.parse(today);
    this.getFecha();
  }
}
