import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerPortfolio } from './photographer-portfolio';

describe('PhotographerPortfolio', () => {
  let component: PhotographerPortfolio;
  let fixture: ComponentFixture<PhotographerPortfolio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerPortfolio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerPortfolio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
