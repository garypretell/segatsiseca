import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-user-incidence',
  templateUrl: './user-incidence.component.html',
  styleUrls: ['./user-incidence.component.css'],
})
export class UserIncidenceComponent implements OnInit, OnDestroy {
  incidences$: Observable<any>;
  p = 1;
  constructor(
    private auth: AuthService,
    private afs: AngularFirestore,
    private router: Router,
    private activatedroute: ActivatedRoute,
  ) {}

  sub;
  ngOnInit(): void {
    this.sub = this.activatedroute.paramMap.pipe(map(params => {
      this.incidences$ = this.afs.collection('incidence', ref => ref.where('uid', '==', params.get('u'))
      .orderBy('createdAt', 'desc')).valueChanges({ idField: 'id' });
    })).subscribe();
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  goHome(): void {
    this.router.navigate(['/Home']);
  }

  eliminar(): void {}

  goStatus(): void {}

  getColor(): void {}
}
