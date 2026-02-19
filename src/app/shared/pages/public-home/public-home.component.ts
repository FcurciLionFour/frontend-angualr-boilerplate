import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-public-home',
  imports: [CommonModule, RouterLink],
  templateUrl: './public-home.component.html',
})
export class PublicHomeComponent {}
