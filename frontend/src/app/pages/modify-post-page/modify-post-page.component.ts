import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, input, effect } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PostsService, TEXT_CONSTRAINTS, TITLE_CONSTRAINTS, UpdatePostDTO } from '@entities/posts';

import { BaseForm } from '@shared/base-components/base-form';

interface UpdatePostForm {
  readonly [key: string]: AbstractControl;
  readonly newTitle: FormControl<string>;
  readonly newText: FormControl<string>;
}

@Component({
  selector: 'app-modify-post-page',
  imports: [ReactiveFormsModule],
  providers: [PostsService],
  templateUrl: './modify-post-page.component.html',
  styleUrl: './modify-post-page.component.scss',
})
export class ModifyPostPageComponent extends BaseForm<UpdatePostForm> {
  public readonly slug = input.required<string>({ alias: 'postSlug' });

  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);

  public readonly TITLE_CONSTRAINTS = TITLE_CONSTRAINTS;
  public readonly TEXT_CONSTRAINTS = TEXT_CONSTRAINTS;
  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields = this.formBuilder.group({
    newTitle: [
      '',
      [
        Validators.required,
        Validators.minLength(TITLE_CONSTRAINTS.minLength),
        Validators.maxLength(TITLE_CONSTRAINTS.maxLength),
      ],
    ],
    newText: ['', [Validators.required, Validators.maxLength(TEXT_CONSTRAINTS.maxLength)]],
  });

  public constructor() {
    super();

    effect((): void => {
      this.postsService.getPost(this.slug()).subscribe({
        next: (post): void => {
          this.formFields.controls.newTitle.setValue(post.title);
          this.formFields.controls.newText.setValue(post.text);
        },
        error: console.error,
      });
    });
  }

  public override onSubmit(): void {
    super.onSubmit();

    this.trimFieldsAndCheckValidation();

    if (this.formFields.valid) {
      console.log('Submitted form:', this.formFields.getRawValue());

      this.sendUserData();
    }
  }

  private trimFieldsAndCheckValidation(): void {
    const { newTitle, newText } = this.formFields.controls;
    this.formFields.patchValue({
      newTitle: newTitle.value.trim(),
      newText: newText.value.trim(),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });
  }

  private sendUserData(): void {
    this.isSubmitting = true;

    const { newTitle, newText } = this.formFields.controls;
    const updatePostDTO: UpdatePostDTO = {
      title: newTitle.value,
      text: newText.value,
    } as const;

    this.postsService.updatePost(this.slug(), updatePostDTO).subscribe({
      next: (): void => {
        this.isSubmitting = false;
        this.router.navigateByUrl('/posts');
      },
      error: (error): void => {
        const internalError = ['Internal server error'];

        if (error instanceof HttpErrorResponse) {
          this.formErrors = error.error?.errors ?? internalError;
        } else {
          this.formErrors = internalError;
        }

        this.isSubmitting = false;
      },
    });
  }
}
