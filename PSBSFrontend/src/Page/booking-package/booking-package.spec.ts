import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingPackage } from './booking-package';

describe('BookingPackage', () => {
  let component: BookingPackage;
  let fixture: ComponentFixture<BookingPackage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingPackage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BookingPackage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
