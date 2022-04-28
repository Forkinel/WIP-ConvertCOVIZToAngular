import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-treatment',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss'],
})
export class TreatmentComponent implements OnInit {
  @Input() node: any;

  constructor() {}

  ngOnInit(): void {}
}
