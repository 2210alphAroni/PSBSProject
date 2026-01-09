import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerSettings } from './photographer-settings';

describe('PhotographerSettings', () => {
  let component: PhotographerSettings;
  let fixture: ComponentFixture<PhotographerSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerSettings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerSettings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
