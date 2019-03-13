import { Component } from '@angular/core';
import { Router, Event } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})

export class AppComponent {
    title = 'CruvitaLite';
    constructor(private _router: Router) {
      this._router.events.subscribe((event: Event) => {
      });
    }
}
