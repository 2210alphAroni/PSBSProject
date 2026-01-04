import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewRating } from './review-rating';

describe('ReviewRating', () => {
  let component: ReviewRating;
  let fixture: ComponentFixture<ReviewRating>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewRating]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewRating);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
