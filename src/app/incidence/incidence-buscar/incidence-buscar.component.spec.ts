import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenceBuscarComponent } from './incidence-buscar.component';

describe('IncidenceBuscarComponent', () => {
  let component: IncidenceBuscarComponent;
  let fixture: ComponentFixture<IncidenceBuscarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidenceBuscarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenceBuscarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
