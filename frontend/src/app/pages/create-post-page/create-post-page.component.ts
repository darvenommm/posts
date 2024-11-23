import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { v4 as createUUID } from 'uuid';

import { BaseForm } from '@shared/base-components/base-form';
import { TITLE_CONSTRAINTS, TEXT_CONSTRAINTS, CreatePostDTO } from '@entities/posts';
import { PostsService } from '@entities/posts';
import { HttpErrorResponse } from '@angular/common/http';

interface CreatePostForm {
  readonly [key: string]: AbstractControl;
  readonly title: FormControl<string>;
  readonly text: FormControl<string>;
}

@Component({
  selector: 'app-create-post-page',
  imports: [ReactiveFormsModule],
  providers: [PostsService],
  templateUrl: './create-post-page.component.html',
  styleUrl: './create-post-page.component.scss',
})
export class CreatePostPageComponent extends BaseForm<CreatePostForm> {
  private readonly postsService = inject(PostsService);
  private readonly router = inject(Router);

  private readonly postId = createUUID();

  public readonly TITLE_CONSTRAINTS = TITLE_CONSTRAINTS;
  public readonly TEXT_CONSTRAINTS = TEXT_CONSTRAINTS;
  public isSubmitting = false;
  public formErrors: string[] = [];

  public readonly formFields = this.formBuilder.group({
    title: [
      '',
      [
        Validators.required,
        Validators.minLength(TITLE_CONSTRAINTS.minLength),
        Validators.maxLength(TITLE_CONSTRAINTS.maxLength),
      ],
    ],
    text: ['', [Validators.required, Validators.maxLength(TEXT_CONSTRAINTS.maxLength)]],
  });

  public override onSubmit(): void {
    super.onSubmit();

    this.trimFieldsAndCheckValidation();

    if (this.formFields.valid) {
      this.sendUserData();
    }
  }

  private trimFieldsAndCheckValidation(): void {
    const { title, text } = this.formFields.controls;
    this.formFields.patchValue({
      title: title.value.trim(),
      text: text.value.trim(),
    });
    this.formFields.updateValueAndValidity({ emitEvent: false });
  }

  private sendUserData(): void {
    this.isSubmitting = true;

    const { title, text } = this.formFields.controls;
    const createPostDTO: CreatePostDTO = {
      id: this.postId,
      title: title.value,
      text: text.value,
    } as const;

    this.postsService.createPost(createPostDTO).subscribe({
      next: (createResult): void => {
        this.isSubmitting = false;
        this.router.navigate(['/posts', createResult.slug]);
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
