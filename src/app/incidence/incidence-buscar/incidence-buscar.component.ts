import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { merge, Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';
declare const jQuery: any;

declare const $;

@Component({
  selector: 'app-incidence-buscar',
  templateUrl: './incidence-buscar.component.html',
  styleUrls: ['./incidence-buscar.component.css'],
})
export class IncidenceBuscarComponent implements OnInit, AfterViewInit {
  @ViewChild('inputEl') inputEl: ElementRef;
  searchIncidencia: any;
  incidencia = null;
  logIncidencia = [];
  busqueda = false;
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    public auth: AuthService
  ) {}

  ngOnInit(): void {}
  ngAfterViewInit(): any {
    setTimeout(() => this.inputEl.nativeElement.focus(), 800);
  }

  goHome(): any {
    this.router.navigate(['/Home']);
  }

  buscar(): any {
    this.logIncidencia = [];
    if (this.searchIncidencia) {
      this.afs.firestore
        .doc(`incidence/${this.searchIncidencia}`)
        .get()
        .then(async (docSnapshot) => {
          if (!docSnapshot.exists) {
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Esta incidencia no ha sido registrada!',
            });
          } else {
            this.busqueda = true;
            const data = docSnapshot.data();
            const id = docSnapshot.id;
            this.incidencia = { id, ...data };
            this.logIncidencia = [];
            const getLogs = await this.afs.firestore
              .collection('incidence_log')
              .where('incidencia', '==', id)
              .orderBy('createdAt', 'asc')
              .get();
            this.logIncidencia = getLogs.docs.map((doc) => doc.data());
          }
        });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Ingrese código de la incidencia!',
      });
      setTimeout(() => this.inputEl.nativeElement.focus(), 800);
    }
  }


  async reiniciar(): Promise<any>{
    const { uid } = await this.auth.getUser();
    Swal.fire({
      title: 'Esta seguro de reiniciar esta incidencia?',
      text: 'Se registrará su código de usuario!',
      icon: 'warning',
      showCancelButton: true,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, Reiniciar!',
    }).then(async (result) => {
      if (result.value) {
        const data: any = {
          estado: 'REGISTRADO',
          area: 'SIN ASIGNAR',
          finalizado: false,
        };
        const log: any = {
          incidencia: this.incidencia.id,
          fecha: Date.parse(firebase.firestore.Timestamp.now().toDate().toISOString().substring(0, 10)),
          createdAt: firebase.firestore.Timestamp.now().toDate(),
          usuario: this.incidencia.uid,
          descripcion: 'Incidencia reiniciada => ' + uid,
        };
        await this.afs.collection('incidence_log').add(log);
        await this.afs.doc(`incidence/${this.incidencia.id}`).set(data, { merge: true });
        await this.afs.firestore
        .doc(`incidence/${this.searchIncidencia}`)
        .get()
        .then(async (docSnapshot) => {
          const datos = docSnapshot.data();
          const id = docSnapshot.id;
          this.incidencia = { id, ...datos };
          this.logIncidencia = [];
          const getLogs = await this.afs.firestore
              .collection('incidence_log')
              .where('incidencia', '==', id)
              .orderBy('createdAt', 'asc')
              .get();
          this.logIncidencia = getLogs.docs.map((doc) => doc.data());
        });
      }
    });
  }

  limpiar(): any {
    this.logIncidencia = [];
    this.incidencia = null;
    this.searchIncidencia = null;
    this.busqueda = true;
    setTimeout(() => this.inputEl.nativeElement.focus(), 500);
  }
}
