
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolService, Rol } from '../../services/rol.service';

@Component({
  selector: 'app-roles-prueba',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2 style="background:white">Prueba de conexión con Spring Boot</h2>

    <p *ngIf="cargando">Cargando roles...</p>

    <p *ngIf="error" style="color: red">
      {{ error }}
    </p>

    <ul style="background:white">
      <li *ngFor="let rol of roles">
        {{ rol.id }} - {{ rol.nombre }} ({{ rol.codigo }})
      </li>
    </ul>
  `
})
export class RolesPruebaComponent implements OnInit {
  private rolService = inject(RolService);

  roles: Rol[] = [];
  cargando = true;
  error = '';

  ngOnInit(): void {
    this.rolService.listar().subscribe({
      next: (data) => {
        this.roles = data;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al consultar roles:', err);
        this.error = 'No se pudieron cargar los roles. Revisa el backend y CORS.';
        this.cargando = false;
      }
    });
  }
}
