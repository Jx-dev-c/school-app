import { Component } from '@angular/core';
import { UsuarioListaComponent } from './components/usuario-lista/usuario-lista';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UsuarioListaComponent, UsuarioFormComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent { }