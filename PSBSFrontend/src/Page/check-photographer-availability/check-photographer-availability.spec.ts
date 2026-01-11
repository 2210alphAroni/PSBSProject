import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckPhotographerAvailability } from './check-photographer-availability';

describe('CheckPhotographerAvailability', () => {
  let component: CheckPhotographerAvailability;
  let fixture: ComponentFixture<CheckPhotographerAvailability>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckPhotographerAvailability]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckPhotographerAvailability);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
