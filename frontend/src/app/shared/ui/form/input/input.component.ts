import { Component, input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type ChangeFn = (value: string) => void;
type TouchedFn = () => void;

@Component({
  selector: 'app-input',
  standalone: true,
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: InputComponent,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  public readonly inputId = input.required<string>();
  public readonly placeholder = input<string>('');
  public readonly valid = input<boolean>(true);

  public value = '';
  public touched = false;
  public disabled = false;

  public onChange: ChangeFn = () => {};
  public onTouched: TouchedFn = () => {};

  public onInput(event: Event): void {
    if (!this.disabled) {
      const target = event.target as HTMLInputElement;
      const { value } = target;

      this.value = value;
      this.onChange(value);
    }
  }

  public onBlur(): void {
    this.markAsTouched();
  }

  public writeValue(newValue: string): void {
    this.value = newValue;
  }

  public registerOnChange(onChange: ChangeFn): void {
    this.onChange = onChange;
  }

  public registerOnTouched(onTouched: TouchedFn): void {
    this.onTouched = onTouched;
  }

  public setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  private markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
