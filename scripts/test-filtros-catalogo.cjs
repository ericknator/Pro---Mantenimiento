// Pruebas de la lógica real del componente con signals de Angular, sin navegador.
// HTTP se sustituye por un listado sintético basado en las etiquetas del catálogo SQL.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const frontend = path.resolve(__dirname, '../frontend');
const requireFrontend = createRequire(path.join(frontend, 'package.json'));
const ts = requireFrontend('typescript');
requireFrontend('@angular/compiler');
const angular = requireFrontend('@angular/core');
const cache = new Map();
function cargar(file) {
  if (cache.has(file)) return cache.get(file);
  const exports = {};
  cache.set(file, exports);
  const componentFile = path.join(frontend, 'src/app/features/administrador/incidencias/todas/todas.component.ts');
  const sourceFile = file === componentFile && process.env.PMS_FILTER_BASELINE_FILE ? process.env.PMS_FILTER_BASELINE_FILE : file;
  const js = ts.transpileModule(fs.readFileSync(sourceFile, 'utf8'), { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, experimentalDecorators: true,
  }}).outputText;
  vm.runInThisContext('(function(exports, require) {' + js + '\n})', { filename: file })(exports, (name) =>
    name.startsWith('.') ? cargar(path.resolve(path.dirname(file), name + '.ts')) : requireFrontend(name));
  return exports;
}
const { TodasComponent } = cargar(path.join(frontend, 'src/app/features/administrador/incidencias/todas/todas.component.ts'));
const { IncidenciasAdminService } = cargar(path.join(frontend, 'src/app/core/services/incidencias-admin.service.ts'));
const registro = (id, codigo, estado, prioridad) => ({ id, codigo: 'QA-' + id, estadoCodigo: codigo,
  estado, prioridad, ubicacion: 'Torre 1' });
function escenario(data) {
  const service = { incidencias: angular.signal(data || [
    registro('1', 'SOLUCIONADA', 'Solucionada - pendiente de confirmación', 'Alta'),
    registro('2', 'SOLUCIONADA', 'Solucionada - pendiente de confirmación', 'Baja'),
    registro('3', 'EN_ATENCION', 'En atención', 'Alta'),
    registro('4', 'CERRADA', 'Cerrada', 'Alta'),
  ]), cargando: angular.signal(false), error: angular.signal(''), cargar: async () => undefined };
  const injector = angular.createEnvironmentInjector([{ provide: IncidenciasAdminService, useValue: service }], null);
  const component = angular.runInInjectionContext(injector, () => new TodasComponent());
  return { component, injector };
}
function caso(nombre, ejecutar, data) {
  test(nombre, () => { const s = escenario(data); try { ejecutar(s.component); } finally { s.injector.destroy(); } });
}
caso('Solucionada + Alta con el nombre largo del catálogo SQL', c => {
  c.filtroEstado.set('Solucionada'); c.filtroPrioridad.set('Alta');
  assert.deepEqual(c.items().map(i => i.id), ['1']);
});
caso('Estado Solucionada sin prioridad combina los dos registros válidos', c => {
  c.filtroEstado.set('Solucionada'); assert.deepEqual(c.items().map(i => i.id), ['1', '2']);
});
caso('Limpiar filtros recupera el listado y restablece los tres controles', c => {
  c.filtroEstado.set('Solucionada'); c.filtroPrioridad.set('Alta'); c.filtroUbicacion.set('Torre 1');
  c.limpiarFiltros(); assert.equal(c.items().length, 4); assert.equal(c.hayFiltrosActivos(), false);
});
caso('Código EN_ATENCION coincide con la etiqueta En atención', c => {
  c.filtroEstado.set('En atención'); assert.deepEqual(c.items().map(i => i.id), ['3']);
});
caso('Cerrada excluye casos pendientes de conformidad', c => {
  c.filtroEstado.set('Cerrada'); assert.deepEqual(c.items().map(i => i.id), ['4']);
});
caso('Respuesta histórica sin código conserva el filtro de Solucionada', c => {
  c.filtroEstado.set('Solucionada'); c.filtroPrioridad.set('Alta');
  assert.deepEqual(c.items().map(i => i.id), ['5']);
}, [registro('5', '', 'Solucionada - pendiente de confirmación', 'Alta')]);
