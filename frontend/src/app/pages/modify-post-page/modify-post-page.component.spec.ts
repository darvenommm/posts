import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModifyPostPageComponent } from './modify-post-page.component';

describe('ModifyPostPageComponent', () => {
  let component: ModifyPostPageComponent;
  let fixture: ComponentFixture<ModifyPostPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModifyPostPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModifyPostPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
