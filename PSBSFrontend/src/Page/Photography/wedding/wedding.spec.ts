import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Wedding } from './wedding';

describe('Wedding', () => {
  let component: Wedding;
  let fixture: ComponentFixture<Wedding>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Wedding]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Wedding);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
