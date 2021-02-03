import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenceReporteComponent } from './incidence-reporte.component';

describe('IncidenceReporteComponent', () => {
  let component: IncidenceReporteComponent;
  let fixture: ComponentFixture<IncidenceReporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidenceReporteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenceReporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
