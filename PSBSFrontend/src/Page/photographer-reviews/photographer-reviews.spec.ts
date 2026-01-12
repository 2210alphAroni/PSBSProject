import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerReviews } from './photographer-reviews';

describe('PhotographerReviews', () => {
  let component: PhotographerReviews;
  let fixture: ComponentFixture<PhotographerReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerReviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
