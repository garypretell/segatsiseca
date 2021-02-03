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
import { finalize } from 'rxjs/operators';
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
  tipoIncidencia: any = [];
  estadoActual: any = 'ASIGNADA';
  imagenes: any = [];
  imagenes2: any = [];
  imageObject = [];
  logIncidencia = [];
  imageObject2 = [];
  area: any;
  p = 1;

  finalizado: any;
  latitude: number;
  longitude: number;
  zoom: number;
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
    this.estadoActual = e.target.vale;
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

  async cambiarestado(item): Promise<void> {
    this.incidenciaId = item.id;
    const { uid } = await this.auth.getUser();
    const estadoNext = this.estado(item.estado);
    if (item.estado === 'EN ATENCIÓN') {
      jQuery(this.showUpload.nativeElement).modal('show');
    } else {
      if (estadoNext) {
        Swal.fire({
          title: `${item.estado} => ${estadoNext}`,
          text: 'No podrá revertir este proceso!',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Actualizar',
        }).then((result) => {
          if (result.isConfirmed) {
            const log: any = {
              incidencia: item.id,
              fecha: Date.now(),
              createdAt: firebase.firestore.Timestamp.now().toDate(),
              usuario: uid,
              descripcion: `Incidencia ${estadoNext}`,
            };
            this.afs.collection('incidence_log').add(log);
            this.afs
              .doc(`incidence/${item.id}`)
              .set({ estado: estadoNext }, { merge: true });
            Swal.fire('Actualizado!', 'Incidencia actualizada.', 'success');
          }
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Esta incidencia no puede ser actualizada!',
        });
      }
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
      .set({ area: $('#area option:selected').html() }, { merge: true });
  }

  async detalles(item): Promise<void> {
    this.imageObject = [];
    this.imageObject2 = [];
    this.logIncidencia = [];
    const getLogs = await this.afs.firestore
      .collection('incidence_log')
      .where('incidencia', '==', item.id).orderBy('createdAt', 'asc')
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
      this.afs
        .doc(`incidence/${this.incidenciaId}`)
        .set({ estado: 'CONCLUÍDA', finalizado: true }, { merge: true });
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
}
