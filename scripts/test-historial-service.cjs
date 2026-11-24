// Ejecuta la lógica real del servicio con transporte, auth y signals sustituidos.
// No sustituye QA de navegador, backend, Firebase real ni entorno desplegado.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('../frontend/node_modules/typescript');

const sourcePath = process.env.PMS_HISTORIAL_SOURCE_PATH || path.join(__dirname,
  '../frontend/src/app/core/services/historial-activos.service.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
  experimentalDecorators: true,
}}).outputText;

function escenario({ activos = [], tareas = [], incidencias = [], fallar = '' } = {}) {
  const peticiones = [];
  const http = { get(url) {
    peticiones.push(url);
    if (fallar && url.endsWith(fallar)) return Promise.reject(new Error('HTTP 503 simulado'));
    if (url.endsWith('/activo')) return Promise.resolve(activos);
    if (url.endsWith('/tarea-preventiva')) return Promise.resolve(tareas);
    if (url.endsWith('/incidencia')) return Promise.resolve(incidencias);
    return Promise.reject(new Error('Endpoint inesperado: ' + url));
  }};
  const exports = {};
  const signal = (initial) => { let value = initial; const read = () => value;
    read.set = (next) => { value = next; }; return read; };
  const modules = {
    '@angular/common/http': { HttpClient: class {}, HttpHeaders: class {} },
    '@angular/core': { Injectable: () => (target) => target, inject: () => http, signal },
    rxjs: { firstValueFrom: (value) => value },
    './firebase.config': { auth: { currentUser: { getIdToken: async () => 'token-sintetico' } } },
    'firebase/auth': { onAuthStateChanged: () => { throw new Error('No debe invocarse'); } },
  };
  vm.runInNewContext(compiled, { exports, require: (name) => {
    if (!(name in modules)) throw new Error('Dependencia no prevista: ' + name);
    return modules[name];
  }}, { filename: sourcePath });
  return { service: new exports.HistorialActivosService(), peticiones };
}
const activo = { id: 1, codigo: 'ACT-A', tipo: 'Ascensor', nombre: 'Ascensor Torre 1', ubicacion: 'Torre 1', estado: 'OPERATIVO' };
const tarea = (override = {}) => ({ id: 10, activo: { id: 1 }, titulo: 'Inspección', fechaProgramada: '2026-11-20T10:00:00', ...override });
const falla = (override = {}) => ({ id: 20, activoId: 1, descripcion: 'Falla reportada', fechaReporte: '2026-11-21T10:00:00', ...override });

test('una lista real vacía no crea un activo QA', async () => {
  const { service } = escenario();
  assert.equal((await service.cargarActivos()).length, 0);
  assert.equal(service.activos().length, 0);
});
test('error al cargar activos queda diferenciado de lista vacía', async () => {
  const { service, peticiones } = escenario({ fallar: '/activo' });
  assert.equal((await service.cargarActivos()).length, 0);
  assert.ok(service.error());
  assert.equal(peticiones.length, 1);
});
test('no mezcla tareas de otro activo del mismo tipo', async () => {
  const { service } = escenario({ tareas: [tarea({ activo: { id: 2 }, titulo: 'Revisión ascensor Torre 2' })] });
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
});
test('no incluye una incidencia sin categoría ni asociación', async () => {
  const { service } = escenario({ incidencias: [falla({ activoId: undefined, ubicacion: 'Jardín', descripcion: 'Pasto seco' })] });
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
  assert.ok(service.advertencia());
});
test('no mezcla fallas de otro ascensor por nombre o categoría', async () => {
  const { service } = escenario({ incidencias: [falla({ activoId: 2, categoria: { nombre: 'Ascensor' }, descripcion: 'Ascensor Torre 2 detenido' })] });
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
});
test('relaciones por ID real ordenan fallas y tareas cronológicamente', async () => {
  const { service } = escenario({ tareas: [tarea({ activo: { id: '1' } })], incidencias: [falla()] });
  const lista = await service.obtenerHistorialDeActivo(activo);
  assert.equal(lista.length, 2);
  assert.equal(lista[0].tipo, 'FALLA');
  assert.equal(lista[1].tipo, 'MANTENIMIENTO');
  assert.equal(service.error(), null);
});
test('código explícito se admite solo cuando no hay un ID contradictorio', async () => {
  const { service } = escenario({ tareas: [tarea({ id: 10, activo: { codigo: 'ACT-A' } }), tarea({ id: 11, activo: { id: 2, codigo: 'ACT-A' } })] });
  const lista = await service.obtenerHistorialDeActivo(activo);
  assert.equal(lista.length, 1);
  assert.equal(lista[0].id, 'tarea-10');
});
test('un fallo HTTP no se presenta como historial vacío confirmado', async () => {
  const { service } = escenario({ fallar: '/incidencia' });
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
  assert.ok(service.error());
});
test('fechas ausentes no se sustituyen por la fecha de ejecución de la prueba', async () => {
  const { service } = escenario({ tareas: [tarea({ fechaProgramada: undefined })] });
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
  assert.ok(service.advertencia());
});
test('el alta usa creadoEn real y no la fecha de instalación', async () => {
  const { service } = escenario();
  const lista = await service.obtenerHistorialDeActivo({ ...activo, creadoEn: '2026-11-01T10:00:00', fechaInstalacion: '2020-01-01' });
  assert.equal(lista.length, 1);
  assert.equal(lista[0].fecha.getFullYear(), 2026);
  assert.ok(!lista[0].descripcion.includes('Prueba'));
});
test('sin datos y sin errores, el historial permanece vacío sin advertencias', async () => {
  const { service } = escenario();
  assert.equal((await service.obtenerHistorialDeActivo(activo)).length, 0);
  assert.equal(service.error(), null);
  assert.equal(service.advertencia(), null);
});
