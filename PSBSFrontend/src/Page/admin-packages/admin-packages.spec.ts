import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPackages } from './admin-packages';

describe('AdminPackages', () => {
  let component: AdminPackages;
  let fixture: ComponentFixture<AdminPackages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPackages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminPackages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
