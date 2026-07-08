import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../../shared/components/toast/toast.component';

@Component({
  selector: 'admin-shell',
  imports: [RouterOutlet, SidebarComponent, ToastComponent],
  templateUrl: './shell.component.html',
})
export class ShellComponent {}
