import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingBookings } from './pending-bookings';

describe('PendingBookings', () => {
  let component: PendingBookings;
  let fixture: ComponentFixture<PendingBookings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingBookings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingBookings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
