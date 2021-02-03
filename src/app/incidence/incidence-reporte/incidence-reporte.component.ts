import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs/Observable';
import { AuthService } from 'src/app/auth/auth.service';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-incidence-reporte',
  templateUrl: './incidence-reporte.component.html',
  styleUrls: ['./incidence-reporte.component.css']
})
export class IncidenceReporteComponent implements OnInit {
  @ViewChild('showModal') showModal: ElementRef;
  private unsubscribe$ = new Subject();
  incidenciatoEdit: any = {};
  incidences$: Observable<any>;
  logIncidencia = [];
  imageObject = [];
  imageObject2 = [];
  finalizado: any;
  usuarioIncidencia: any;

  p = 1;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.incidences$ = this.afs
    .collection('incidence', (ref) =>
      ref.where('estado', '==', 'CONCLUÍDA').orderBy('createdAt', 'desc')
    ).valueChanges({ idField: 'id' });
  }

  async detalles(item): Promise<any> {
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
    snapshot.docs.map((doc) => doc.data())
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
    snapshot2.docs.map((doc) => doc.data())
    .forEach((downlineItem) => {
      this.imageObject2.push({
        image: downlineItem.path,
        thumbImage: downlineItem.path,
      });
    });
    jQuery(this.showModal.nativeElement).modal('show');
  }

}
