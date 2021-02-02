import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenceAreaComponent } from './incidence-area.component';

describe('IncidenceAreaComponent', () => {
  let component: IncidenceAreaComponent;
  let fixture: ComponentFixture<IncidenceAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidenceAreaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenceAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
