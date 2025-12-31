import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsUse } from './terms-use';

describe('TermsUse', () => {
  let component: TermsUse;
  let fixture: ComponentFixture<TermsUse>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsUse]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsUse);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
