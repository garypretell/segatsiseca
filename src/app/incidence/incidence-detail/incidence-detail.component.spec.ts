import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenceDetailComponent } from './incidence-detail.component';

describe('IncidenceDetailComponent', () => {
  let component: IncidenceDetailComponent;
  let fixture: ComponentFixture<IncidenceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IncidenceDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IncidenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
