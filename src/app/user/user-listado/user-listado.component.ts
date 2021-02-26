import { AfterViewInit, ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { Observable } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import Swal from 'sweetalert2';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-user-listado',
  templateUrl: './user-listado.component.html',
  styleUrls: ['./user-listado.component.css']
})
export class UserListadoComponent implements OnInit, AfterViewInit {
  @ViewChild('inputEl') inputEl: ElementRef;
  @ViewChild('editModal') editModal: ElementRef;
  usuarios$: Observable<any>;
  areas$: Observable<any>;
  searchDni: any;
  private unsubscribe$ = new Subject();
  usuariotoEdit: any = {};
  usuariotoArray: any = [];

  area: any;
  tipousuario: any;
  subscriber: any;
  editor: any;
  admin: any;
  super: any;
  principal: any;

  searchDoc: any = { descripcion: '' };
  sedes$: Observable<any>;
  tipoUsuario$: Observable<any>;
  constructor(
    public afs: AngularFirestore,
    public router: Router,
    public activatedroute: ActivatedRoute,
    public auth: AuthService
  ) { }

  async ngOnInit(): Promise<void> {
    this.sedes$ = this.afs.collection('areas', ref => ref.orderBy('descripcion', 'asc')).valueChanges({idField: 'id'});
    this.tipoUsuario$ = this.afs.collection('tipo_usuario', ref => ref.orderBy('descripcion', 'asc')).valueChanges({idField: 'id'});
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.inputEl.nativeElement.focus(), 500);
  }

  goHome(): void {
    this.router.navigate(['Home']);
  }

  getColor(estado): any {
    switch (estado) {
      case true:
        return 'green';
      case false:
        return 'black';
    }
  }

  async buscar(): Promise<void> {
    const snapshot = await this.afs.firestore.collection('usuarios').where('dni', '==', +this.searchDni).get();
    const data = snapshot.docs.map(doc => doc.data());
    if (data.length > 0){
      this.usuariotoArray = data;
    }else{
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Este usuario no ha sido registrado!',
      });
      this.usuariotoArray = [];
      this.searchDni = null;
    }
    setTimeout(() => this.inputEl.nativeElement.focus(), 500);
  }

  deleteUsusario(usuario): any {

  }

  editUsuario(usuario): any {
    this.afs.firestore
      .doc(`usuarios/${usuario.uid}`)
      .get()
      .then((docSnapshot) => {
        if (!docSnapshot.exists) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Este usuario no ha sido registrado!',
          });
        } else {
          const user = docSnapshot.data();
          this.usuariotoEdit = usuario.uid;
          this.subscriber = true;
          this.area = user.area;
          this.tipousuario = user.tipousuario;
          this.editor = user.roles.editor;
          this.admin = user.roles.admin;
          this.super = user.roles.super;
          this.principal = user.principal;

          jQuery(this.editModal.nativeElement).modal('show');
        }
      });
    jQuery(this.editModal.nativeElement).modal('show');
  }

  async updateUsuario(): Promise<any> {

    switch (this.tipousuario) {
      case 'GERENTE':
        this.principal = false;
        this.super = true;
        this.admin = true;
        this.editor = true;
        break;
      case 'SECRETARIA GENERAL':
        this.principal = true;
        this.super = false;
        this.admin = true;
        this.editor = true;
        break;
      case 'SECRETARIA DE AREA':
        this.principal = false;
        this.super = false;
        this.admin = false;
        this.editor = true;
        break;
      case 'SUPERVISOR':
        this.principal = false;
        this.super = false;
        this.admin = false;
        this.editor = true;
        break;
      case 'CIUDADANO':
        this.principal = false;
        this.super = false;
        this.admin = false;
        this.editor = false;
        break;
      default:
        console.log('Lo lamentamos, por el momento no disponemos de ');
    }
    const data: any = {
      roles: {
        super: this.super,
        admin: this.admin,
        editor: this.editor
      },
      tipousuario: this.tipousuario,
      area: this.area,
      principal: this.principal
    };
    await this.afs
      .doc(`usuarios/${this.usuariotoEdit}`)
      .set(data, { merge: true });
    jQuery(this.editModal.nativeElement).modal('hide');
  }

  nuevaArea(): void {}
}
