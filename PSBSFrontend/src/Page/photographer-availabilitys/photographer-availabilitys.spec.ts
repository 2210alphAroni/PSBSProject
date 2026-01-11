import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerAvailabilitys } from './photographer-availabilitys';

describe('PhotographerAvailabilitys', () => {
  let component: PhotographerAvailabilitys;
  let fixture: ComponentFixture<PhotographerAvailabilitys>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerAvailabilitys]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerAvailabilitys);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
