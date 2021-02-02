import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-area',
  templateUrl: './user-area.component.html',
  styleUrls: ['./user-area.component.css']
})
export class UserAreaComponent implements OnInit, OnDestroy {
  miusuario: any = {};
  usuarios$: Observable<any>;
  searchObject: any = {};

  subscriber: any;
  editor: any;
  admin: any;
  super: any;
  constructor(
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute
  ) { }

  sub;
  async ngOnInit(): Promise<void> {
    const { uid } = await this.auth.getUser();
    this.sub =  await this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((m: any) => {
      this.miusuario = m;
      this.usuarios$ = this.afs.collection('usuarios', ref => ref.where('area', '==', m.area)).valueChanges({idField: 'id'});
    })).subscribe();
  }

  ngOnDestroy(): any {
    this.sub.unsubscribe();
    // this.unsubscribe$.next();
    // this.unsubscribe$.complete();
  }
  editUsuario(usuario): void {}

  deleteUsusario(usuario): void {}

  goReporte(usuario): void {}

  updateUsuario(): void {}

  goHome(): void {}

}
