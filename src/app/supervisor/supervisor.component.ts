import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-supervisor',
  templateUrl: './supervisor.component.html',
  styleUrls: ['./supervisor.component.css']
})
export class SupervisorComponent implements OnInit {
  @ViewChild('myimgModal') myimgModal: ElementRef;
  @ViewChild('showModal') showModal: ElementRef;
  @ViewChild('showUpload') showUpload: ElementRef;
  @ViewChild('inputFile') inputFile: ElementRef;
  incidencias$: Observable<any>;
  estado = 'EN ATENCIÓN';
  limit = 5;
  p = 1;
  usuarioID: any;
  public uploadForm: FormGroup;

  selectedFiles: FileList;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  incidenciaId: any;
  visible: boolean;
  progressInfos = [];

  imagenes: any = [];
  imagenes2: any = [];
  imageObject = [];
  logIncidencia = [];
  imageObject2 = [];
  finalizado: any;
  miincidencia: any;
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
    this.usuarioID = uid;
    this.incidencias$ = this.afs
    .collection('incidence', (ref) =>
      ref
        .where('supervisor', '==', this.usuarioID)
        .where('estado', '==', this.estado)
        .limit(this.limit)
        .orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });

  }

  filterLista(e): any{
    this.estado = e.target.value;
    this.incidencias$ = this.afs
    .collection('incidence', (ref) =>
      ref
        .where('supervisor', '==', this.usuarioID)
        .where('estado', '==', this.estado)
        .limit(this.limit)
        .orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
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
    jQuery(this.showModal.nativeElement).modal('show');
  }

  asignarModal(item): any {
    this.progressInfos = null;
    this.selectedFiles = null;
    this.inputFile.nativeElement.value = '';
    this.uploadForm.reset();
    this.incidenciaId = item.id;
    jQuery(this.showUpload.nativeElement).modal('show');
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
        <title>Print tab</title>
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

  imagen(): any {
    // this.myimgModal.nativeElement.style.backgroundColor = 'red';
    // modal.style.display = "block";
    // modalImg.src = this.src;
  }

}
