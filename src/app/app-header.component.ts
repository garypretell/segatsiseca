import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router, ActivatedRoute } from '@angular/router';
import { AngularFirestore } from '@angular/fire/firestore';
import { AuthService } from './auth/auth.service';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import { Observable, Subject, of } from 'rxjs';
import { map, takeUntil, switchMap } from 'rxjs/operators';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-header',
  templateUrl: 'app-header.component.html',
  styleUrls: ['./app-header.component.css'],
})
export class AppHeaderComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject();
  name$: any;
  foto: any;
  super: boolean;
  miusuario: any = {};
  constructor(
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  sub;
  async ngOnInit(): Promise<void> {
    const { uid } = await this.auth.getUser();
    this.sub =  await this.afs.doc(`usuarios/${uid}`).valueChanges().pipe(map((m: any) => {
      this.miusuario = m;
    })).subscribe();
  }

  ngOnDestroy(): any {
    this.sub.unsubscribe();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  signOut(): void {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

  goUsuarios(): void {
    if (this.miusuario.principal) {
      this.router.navigate(['usuario']);
    }else {
      this.router.navigate(['usuario', 'area']);
    }
  }

  goReportes(): void {
    this.router.navigate(['incidence', 'reporte']);
  }

  goIncidencias(): void {
    if (this.miusuario.principal) {
      this.router.navigate(['incidence', 'listado']);
    }else {
      this.router.navigate(['incidence', 'area']);
    }
  }
}
