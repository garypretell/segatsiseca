import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Observable, Observer, fromEvent, merge, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  conexion: boolean;
  constructor(public auth: AuthService) {
  }

  ngOnInit(): any {
    this.createOnline$().subscribe(isOnline => this.conexion = isOnline);
  }

  createOnline$(): any {
    return merge<boolean>(
      fromEvent(window, 'offline').pipe(map(() => false)),
      fromEvent(window, 'online').pipe(map(() => true)),
      new Observable((sub: Observer<boolean>) => {
        sub.next(navigator.onLine);
        sub.complete();
      }));
  }

}
