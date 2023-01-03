import {AfterViewChecked, Component, Input, OnDestroy, OnInit} from '@angular/core';

@Component({
  selector: 'app-connection-indicator',
  templateUrl: './connection-indicator.component.html'
})
export class ConnectionIndicatorComponent {

  constructor() {
  }

  @Input() connectionState: string;
}
