import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoByCat } from './photo-by-cat';

describe('PhotoByCat', () => {
  let component: PhotoByCat;
  let fixture: ComponentFixture<PhotoByCat>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoByCat]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotoByCat);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
