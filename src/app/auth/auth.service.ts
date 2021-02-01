import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { switchMap, map, first, take } from 'rxjs/operators';
import { User } from './user';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import firebase from 'firebase/app';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticated$: Observable<boolean>;
  user$: Observable<any>;

  constructor(private afs: AngularFirestore, public afAuth: AngularFireAuth) {
    this.authenticated$ = afAuth.authState.pipe(map(user => !!user));
    this.user$ = this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
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
      console.log('Error->', error);
      return false;
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

  async signOut() {
    await this.afAuth.signOut();
  }

  private async createUserData(user: any, usuario: any ) {

    const usuarioRef: AngularFirestoreDocument<any> = this.afs.doc(`usuarios/${user.uid}`);
    const data: any = {
      photoURL: user.photoURL,
      createdAt: firebase.firestore.Timestamp.now().toDate(),
      uid: user.uid,
      displayName: usuario.displayName,
      email: usuario.email,
      estado: true,
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
}
