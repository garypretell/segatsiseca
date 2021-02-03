import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MapsAPILoader, MouseEvent } from '@agm/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';
import { AuthService } from '../auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { finalize, take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import firebase from 'firebase/app';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-incidence',
  templateUrl: './incidence.component.html',
  styleUrls: ['./incidence.component.css'],
})
export class IncidenceComponent implements OnInit {
  private unsubscribe$ = new Subject();
  selectedFiles: FileList;
  uploadPercent: Observable<number>;
  downloadURL: Observable<string>;
  visible: boolean;
  progressInfos = [];
  message = '';

  misimagenes$: Observable<any>;
  misdatos: any[] = [];

  title = 'segatsiseca';
  logueado = false;

  latitude: number;
  longitude: number;
  zoom: number;
  address: string;
  private geoCoder;
  public incidenceForm: FormGroup;
  @ViewChild('search')
  public searchElementRef: ElementRef;
  constructor(
    private authservice: AuthService,
    private mapsAPILoader: MapsAPILoader,
    private ngZone: NgZone,
    public router: Router,
    private storage: AngularFireStorage,
    public formBuilder: FormBuilder,
    public afs: AngularFirestore,
    public activatedroute: ActivatedRoute
  ) {
    this.incidenceForm = this.formBuilder.group({
      descripcion: ['', [Validators.required]],
      direccion: ['', [Validators.required]],
      // telefono: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.setCurrentLocation();
  }

  private setCurrentLocation(): void {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.latitude = position.coords.latitude;
        this.longitude = position.coords.longitude;
        this.zoom = 12;
      });
    }
  }

  markerDragEnd($event: MouseEvent): void {
    console.log($event);
    this.latitude = $event.coords.lat;
    this.longitude = $event.coords.lng;
  }

  goHome(): void {
    this.router.navigate(['/Home']);
  }

  selectFiles(event): any {
    this.progressInfos = [];
    this.selectedFiles = event.target.files;
  }

  async uploadFiles(): Promise<any> {
    const uploadId = this.afs.createId();
    const { uid } = await this.authservice.getUser();
    if (this.incidenceForm.value.descripcion) {
      this.visible = true;
      for (let i = 0; i < this.selectedFiles.length; i++) {
        this.upload(i, this.selectedFiles[i], uploadId, uid );
      }
      const data: any = {
        incidencia: this.incidenceForm.value.descripcion,
        direccion: this.incidenceForm.value.direccion,
        // telefono: this.incidenceForm.value.telefono,
        fechaReg: Date.now(),
        createdAt: firebase.firestore.Timestamp.now().toDate(),
        latitud: this.latitude,
        longitud: this.longitude,
        uid,
        estado: 'REGISTRADO',
        area: 'SIN ASIGNAR',
        finalizado: false
      };
      const log: any = {
        incidencia: uploadId,
        fecha: Date.now(),
        createdAt: firebase.firestore.Timestamp.now().toDate(),
        usuario: uid,
        descripcion: 'Incidencia creada'
      };
      this.afs.collection('incidence_log').add(log);
      this.afs.doc(`incidence/${uploadId}`).set(data);
      this.goHome();
    }else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese descripción!',
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
            finalizado: false
          };
          this.afs.collection('imagenes').add(imagenes);
        })
      )
      .subscribe();
  }
}
