import { Directive, ElementRef, OnInit } from '@angular/core';

@Directive({
  selector: '[appAutofocus]',
  standalone: true
})
export class AutofocusDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    // Small timeout to ensure the element is rendered in DOM before focusing
    setTimeout(() => {
      this.el.nativeElement.focus();
    }, 50);
  }
}
