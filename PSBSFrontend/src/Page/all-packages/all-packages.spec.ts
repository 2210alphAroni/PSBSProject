import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllPackages } from './all-packages';

describe('AllPackages', () => {
  let component: AllPackages;
  let fixture: ComponentFixture<AllPackages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllPackages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllPackages);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
