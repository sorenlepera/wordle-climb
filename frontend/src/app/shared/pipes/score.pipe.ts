import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'scoreFormat',
  standalone: true
})
export class ScorePipe implements PipeTransform {
  transform(value: number | undefined | null): string {
    if (value == null) return '0 pts';
    const formatted = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return `${formatted} pts`;
  }
}
