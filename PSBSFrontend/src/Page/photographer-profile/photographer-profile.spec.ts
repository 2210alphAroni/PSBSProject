import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerProfile } from './photographer-profile';

describe('PhotographerProfile', () => {
  let component: PhotographerProfile;
  let fixture: ComponentFixture<PhotographerProfile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerProfile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerProfile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
