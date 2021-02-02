import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserListadoComponent } from './user-listado.component';

describe('UserListadoComponent', () => {
  let component: UserListadoComponent;
  let fixture: ComponentFixture<UserListadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserListadoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UserListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
