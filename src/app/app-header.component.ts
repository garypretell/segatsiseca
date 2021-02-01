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
  constructor(
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public afs: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute
  ) {}

  sub;
  ngOnInit(): void {
    this.sub = this.afAuth.authState
      .pipe(
        switchMap((data) => {
          if (data) {
            this.name$ = data.displayName;
            this.foto = data.photoURL;
            return this.afs
              .doc(`usuarios/${data.uid}`)
              .valueChanges()
              .pipe(
                map((m: any) => {
                  this.super = m.roles.super;
                })
              );
          } else {
            return of(null);
          }
        })
      )
      .subscribe();
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
}
