import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map, first, take } from 'rxjs/operators';
import { User } from './user';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';
import Swal from 'sweetalert2';

import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet; charset=UTF-8';
const EXCEL_EXT = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated$: Observable<boolean>;
  isEmailVerified$: Observable<boolean>;
  user$: Observable<any>;

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth) {
    this.authenticated$ = afAuth.authState.pipe(map(user => !!user));
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          this.isEmailVerified$ = of(user.emailVerified);
          return this.afs.doc(`usuarios/${user.uid}`).valueChanges();
        } else {
          return of(null);
        }
      }));
  }

  async resetPassword(email: string): Promise<void> {
    try {
      return this.afAuth.sendPasswordResetEmail(email);
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async register(usuario: any): Promise<any> {
    try {
      const { user } = await this.afAuth.createUserWithEmailAndPassword(usuario.email, usuario.password);
      await this.createUserData(user, usuario);
      await this.sendVerifcationEmail();
      return user;
    } catch (error) {
      console.log('Error->', error);
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      const { user } = await this.afAuth.signInWithEmailAndPassword(email, password);
      return user;
    } catch (error) {
      Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: this.convertMessage(error['code']),
        });
      console.log('Error->', error);
      return false;
    }
  }

  convertMessage(code: string): string {
    switch (code) {
      case 'auth/user-disabled': {
        return 'Sorry your user is disabled.';
      }
      case 'auth/user-not-found': {
        return 'Usuario no registrado.';
      }
      case 'auth/wrong-password': {
        return 'Contraseña incorrecta.';
      }
      default: {
        return 'Login error try again later.';
      }
    }
  }

  sendVerifcationEmail(): any {
    return this.afAuth.currentUser.then((u: any) => u.sendEmailVerification());
  }

  isEmailVerified(user: any): boolean {
    return user.emailVerified === true ? true : false;
  }

  getUser(): any {
    return this.user$.pipe(take(1)).toPromise();
  }

  async signOut(): Promise<void> {
    await this.afAuth.signOut();
  }

  private async createUserData(user: any, usuario: any ): Promise<void> {

    const usuarioRef: AngularFirestoreDocument<any> = this.afs.doc(`usuarios/${user.uid}`);
    const data: any = {
      photoURL: user.photoURL,
      createdAt: firebase.firestore.Timestamp.now().toDate(),
      uid: user.uid,
      dni: usuario.dni,
      displayName: usuario.displayName,
      email: usuario.email,
      telefono: usuario.telefono,
      estado: true,
      principal: false,
      disponible: true,
      area: 'CIUDADANÍA',
      tipousuario: 'CIUDADANO',
      roles: {
        subscriber: true,
        editor: false,
        admin: false,
        super: false
      }
    };
    return usuarioRef.set(data);
  }

  ///// Role-based Authorization /////

  canRead(user: User): boolean {
    const allowed = ['admin', 'editor', 'subscriber', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canEdit(user: User): boolean {
    const allowed = ['admin', 'editor', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canDelete(user: User): boolean {
    const allowed = ['admin', 'super'];
    return this.checkAuthorization(user, allowed);
  }

  canSuper(user: User): boolean {
    const allowed = ['super'];
    return this.checkAuthorization(user, allowed);
  }

  private checkAuthorization(user: any, allowedRoles: string[]): boolean {
    // tslint:disable-next-line:curly
    if (!user) return false;
    for (const role of allowedRoles) {
      if (user.roles[role]) {
        return true;
      }
    }
    return false;
  }

  exportToExcel(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data']
    };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcel(excelBuffer, excelFileName);
  }

  private saveAsExcel(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + '_' + Date.now() + EXCEL_EXT);
  }
}
