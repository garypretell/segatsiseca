import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  constructor(public formBuilder: FormBuilder,
              private afs: AngularFirestore,
              public auth: AuthService,
              private router: Router,
) { }

  ngOnInit(): void {
  }

  async goIncidencias(): Promise<any>{
    const { uid } = await this.auth.getUser();
    this.router.navigate(['usuario', uid, 'incidences']);
  }

  goRegistrar(): void{
    this.router.navigate(['incidence']);
  }

  goFs(): void {}

  goLogin(): any {
    this.auth.signOut().then(() => {
      this.router.navigate(['/']);
    });
  }

}
