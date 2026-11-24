import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

import {
  AltaUsuarioRequest,
  GestionUsuariosService,
  UnidadAdministrada,
  UsuarioAdministrado,
} from '../../../../core/services/gestion-usuarios.service';

type TipoOcupacion = 'PROPIETARIO' | 'INQUILINO';
type EstadoUsuario = 'ACTIVO' | 'INACTIVO';

interface FormularioUsuario {
  nombres: string;
  apellidos: string;
  correo: string;
  telefono: string;
  claveTemporal: string;
  unidadId: number | null;
  relacion: TipoOcupacion;
}

@Component({
  selector: 'app-gestion-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gestion-usuarios.component.html',
  styleUrl: './gestion-usuarios.component.scss',
})
export class GestionUsuariosComponent implements OnInit {
  private readonly gestionUsuarios = inject(GestionUsuariosService);

  usuarios: UsuarioAdministrado[] = [];
  unidades: UnidadAdministrada[] = [];
  busqueda = '';
  filtroEstado: 'TODOS' | EstadoUsuario = 'TODOS';
  mostrarFormulario = false;
  intentandoGuardar = false;
  cargando = true;
  errorCarga = '';
  errorAlta = '';
  mensajeExito = '';

  readonly formularioInicial = (): FormularioUsuario => ({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    claveTemporal: '',
    unidadId: null,
    relacion: 'PROPIETARIO',
  });

  formulario = this.formularioInicial();
  readonly altaHabilitada = true;

  ngOnInit(): void {
    void this.cargarDatos();
  }

  get usuariosFiltrados(): UsuarioAdministrado[] {
    const termino = this.busqueda.trim().toLowerCase();

    return this.usuarios.filter((usuario) => {
      const nombre = `${usuario.nombres} ${usuario.apellidos}`.toLowerCase();
      const unidades = this.unidadesTexto(usuario).toLowerCase();
      const estado: EstadoUsuario = usuario.activo ? 'ACTIVO' : 'INACTIVO';

      const coincideBusqueda =
        !termino ||
        nombre.includes(termino) ||
        usuario.correo.toLowerCase().includes(termino) ||
        unidades.includes(termino);
      const coincideEstado = this.filtroEstado === 'TODOS' || estado === this.filtroEstado;

      return coincideBusqueda && coincideEstado;
    });
  }

  get totalActivos(): number {
    return this.usuarios.filter((usuario) => usuario.activo).length;
  }

  abrirFormulario(): void {
    this.formulario = this.formularioInicial();
    this.intentandoGuardar = false;
    this.errorAlta = '';
    this.mostrarFormulario = true;
  }

  cerrarFormulario(): void {
    if (this.intentandoGuardar) {
      return;
    }
    this.mostrarFormulario = false;
    this.intentandoGuardar = false;
    this.errorAlta = '';
  }

  async registrarUsuario(form: NgForm): Promise<void> {
    this.mensajeExito = '';
    this.errorAlta = '';
    this.intentandoGuardar = true;

    if (form.invalid || !this.formulario.unidadId) {
      form.control.markAllAsTouched();
      this.intentandoGuardar = false;
      return;
    }

    const request: AltaUsuarioRequest = {
      ...this.formulario,
      unidadId: this.formulario.unidadId,
    };

    try {
      const creado = await this.gestionUsuarios.registrarUsuario(request);
      this.usuarios = [...this.usuarios, creado];
      this.mostrarFormulario = false;
      this.formulario = this.formularioInicial();
      this.mensajeExito = 'Usuario creado en Firebase y asociado a su unidad.';
    } catch (error) {
      this.errorAlta = this.mensajeError(error, 'No se pudo crear el usuario.');
    } finally {
      this.intentandoGuardar = false;
    }
  }

  limpiarFiltros(): void {
    this.busqueda = '';
    this.filtroEstado = 'TODOS';
  }

  unidadesTexto(usuario: UsuarioAdministrado): string {
    return usuario.unidades?.map((unidad) => {
      const relacion = unidad.relacion ? ` (${unidad.relacion.toLowerCase()})` : '';
      return `${unidad.etiqueta}${relacion}`;
    }).join(', ') || 'Sin unidad';
  }

  private async cargarDatos(): Promise<void> {
    this.cargando = true;
    this.errorCarga = '';

    try {
      [this.usuarios, this.unidades] = await Promise.all([
        this.gestionUsuarios.listarUsuarios(),
        this.gestionUsuarios.listarUnidades(),
      ]);
    } catch (error) {
      this.errorCarga = this.mensajeError(error, 'No se pudieron cargar usuarios y unidades.');
    } finally {
      this.cargando = false;
    }
  }

  private mensajeError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      return error.error?.mensaje || fallback;
    }
    return error instanceof Error ? error.message : fallback;
  }
}
