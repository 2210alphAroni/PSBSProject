import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotographerEarnings } from './photographer-earnings';

describe('PhotographerEarnings', () => {
  let component: PhotographerEarnings;
  let fixture: ComponentFixture<PhotographerEarnings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotographerEarnings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographerEarnings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
