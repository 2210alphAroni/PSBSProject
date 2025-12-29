import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerDashboard } from './photographer-dashboard';

describe('PhotographerDashboard', () => {
  let component: PhotographerDashboard;
  let fixture: ComponentFixture<PhotographerDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
