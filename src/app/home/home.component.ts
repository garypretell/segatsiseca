import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';
declare const jQuery: any;
declare const $;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  @ViewChild('editModal') editModal: ElementRef;
  rutas: any;
  constructor(
    public formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): any {}

  async goIncidencias(): Promise<any> {
    const { uid } = await this.auth.getUser();
    this.router.navigate(['usuario', uid, 'incidences']);
  }

  goRegistrar(): void {
    this.router.navigate(['incidence']);
  }

  administrar(): void {
    this.router.navigate(['usuario', 'buscar']);
  }

  goLogin(): any {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  async goTareas(user): Promise<any> {
    const snapshot = await this.afs.firestore
      .collection('tipo_usuario')
      .where('descripcion', '==', user.tipousuario)
      .get();
    const data: any = snapshot.docs.map((doc) => doc.data());
    if (data[0].rutas.length > 1) {
      this.rutas = data[0].rutas;
      jQuery(this.editModal.nativeElement).modal('show');
    } else {
      this.router.navigate([data[0].rutas[0].path]);
    }
  }

  tareas(item): any {
    jQuery(this.editModal.nativeElement).modal('hide');
    this.router.navigate([item.path]);
  }
}
