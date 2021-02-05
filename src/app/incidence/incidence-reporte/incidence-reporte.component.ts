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

  tableData: any[] = [];

  firstInResponse: any = [];

  lastInResponse: any = [];

  prev_strt_at: any = [];

  pagination_clicked_count = 0;

  disable_next = false;
  disable_prev = false;
  limit = 10;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadItems();
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

  loadItems(): any {
    this.afs
      .collection('incidence', ref => ref.where('estado', '==', 'CONCLUÍDA').orderBy('createdAt', 'desc'))
      .snapshotChanges()
      .subscribe(
        (response) => {
          if (!response.length) {
            console.log('No Data Available');
            return false;
          }
          this.firstInResponse = response[0].payload.doc;
          this.lastInResponse = response[response.length - 1].payload.doc;

          this.tableData = [];
          for (const item of response) {
            const data: any = item.payload.doc.data();
            const id = item.payload.doc.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.prev_strt_at = [];
          this.pagination_clicked_count = 0;
          this.disable_next = false;
          this.disable_prev = false;

          this.push_prev_startAt(this.firstInResponse);
        },
        (error) => {}
      );
  }

  prevPage(): any {
    this.disable_prev = true;
    this.afs
      .collection('incidence', (ref) =>
      ref.where('estado', '==', 'CONCLUÍDA').orderBy('createdAt', 'desc')
          .startAt(this.get_prev_startAt())
          .endBefore(this.firstInResponse)
          .limit(this.limit)
      )
      .get()
      .subscribe(
        (response) => {
          this.firstInResponse = response.docs[0];
          this.lastInResponse = response.docs[response.docs.length - 1];

          this.tableData = [];
          for (const item of response.docs) {
            const data: any = item.data();
            const id = item.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.pagination_clicked_count--;

          this.pop_prev_startAt(this.firstInResponse);

          this.disable_prev = false;
          this.disable_next = false;
        },
        (error) => {
          this.disable_prev = false;
        }
      );
  }

  nextPage(): any {
    this.disable_next = true;
    this.afs
      .collection('incidence', (ref) =>
      ref.where('estado', '==', 'CONCLUÍDA').orderBy('createdAt', 'desc')
          .startAfter(this.lastInResponse)
      )
      .get()
      .subscribe(
        (response) => {
          if (!response.docs.length) {
            this.disable_next = true;
            return;
          }

          this.firstInResponse = response.docs[0];

          this.lastInResponse = response.docs[response.docs.length - 1];
          this.tableData = [];
          for (const item of response.docs) {
            const data: any = item.data();
            const id = item.id;
            const final: any = { id, ...data };
            this.tableData.push(final);
          }

          this.pagination_clicked_count++;

          this.push_prev_startAt(this.firstInResponse);

          this.disable_next = false;
        },
        (error) => {
          this.disable_next = false;
        }
      );
  }

  push_prev_startAt(prev_first_doc): any {
    this.prev_strt_at.push(prev_first_doc);
  }

  pop_prev_startAt(prev_first_doc): any {
    this.prev_strt_at.forEach((element) => {
      if (prev_first_doc.data().id === element.data().id) {
        element = null;
      }
    });
  }

  get_prev_startAt(): any {
    if (this.prev_strt_at.length > this.pagination_clicked_count + 1) {
      this.prev_strt_at.splice(
        this.prev_strt_at.length - 2,
        this.prev_strt_at.length - 1
      );
    }
    return this.prev_strt_at[this.pagination_clicked_count - 1];
  }

  readableDate(time): any {
    const d = new Date(time);
    return d.getDate() + '/' + d.getMonth() + '/' + d.getFullYear();
  }

}
