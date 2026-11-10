import { describe, it, expect } from 'vitest';
import type { AreaId } from '../engine/types';
import {
  buildScene,
  featuresFromProfile,
  focusBox,
  sceneFrame,
  DEMO_FEATURES,
  AREA_ORDER,
  type Scene,
  type SceneFeatures,
  type Tipo,
} from './scene';

const NONE: SceneFeatures = {
  archivero: false,
  computadora: false,
  celular: false,
  camaras: false,
  biometria: false,
  nube: false,
  contador: false,
  ti: false,
  marketing: false,
  delivery: false,
  equipo: 1,
};

const ALL: SceneFeatures = {
  archivero: true,
  computadora: true,
  celular: true,
  camaras: true,
  biometria: true,
  nube: true,
  contador: true,
  ti: true,
  marketing: true,
  delivery: true,
  equipo: 3,
};

const ids = (s: Scene) => s.items.map((i) => i.id);
const flowIds = (s: Scene) => s.flows.map((f) => f.id);
const place = (s: Scene, area: AreaId) => s.callouts.find((c) => c.area === area)!.place;

describe('featuresFromProfile', () => {
  it('sin respuestas de perfil devuelve el conjunto vacío', () => {
    expect(featuresFromProfile({})).toEqual(NONE);
  });

  it('traduce canales, herramientas y terceros a las piezas del dibujo', () => {
    expect(featuresFromProfile({ canales: ['papel'] }).archivero).toBe(true);
    expect(featuresFromProfile({ herramientas: ['archivo'] }).archivero).toBe(true);
    expect(featuresFromProfile({ herramientas: ['excel'] }).computadora).toBe(true);
    expect(featuresFromProfile({ herramientas: ['sistema'] }).computadora).toBe(true);
    expect(featuresFromProfile({ canales: ['whatsapp'] }).celular).toBe(true);
    expect(featuresFromProfile({ herramientas: ['celular'] }).celular).toBe(true);
    expect(featuresFromProfile({ canales: ['camaras'] }).camaras).toBe(true);
    expect(featuresFromProfile({ canales: ['biometria'] }).biometria).toBe(true);
    expect(featuresFromProfile({ herramientas: ['nube'] }).nube).toBe(true);
    expect(featuresFromProfile({ terceros: ['contador'] }).contador).toBe(true);
    expect(featuresFromProfile({ terceros: ['ti'] }).ti).toBe(true);
    expect(featuresFromProfile({ terceros: ['marketing'] }).marketing).toBe(true);
    expect(featuresFromProfile({ terceros: ['delivery'] }).delivery).toBe(true);
    const ninguno = featuresFromProfile({ terceros: ['ninguno'] });
    expect(ninguno.contador).toBe(false);
    expect(ninguno.ti).toBe(false);
    expect(ninguno.marketing).toBe(false);
    expect(ninguno.delivery).toBe(false);
  });

  it('cuenta el equipo según el tamaño del negocio', () => {
    expect(featuresFromProfile({ tamano: ['solo'] }).equipo).toBe(1);
    expect(featuresFromProfile({ tamano: ['2-10'] }).equipo).toBe(2);
    expect(featuresFromProfile({ tamano: ['11-50'] }).equipo).toBe(3);
    expect(featuresFromProfile({ tamano: ['50+'] }).equipo).toBe(3);
    expect(featuresFromProfile({}).equipo).toBe(1);
  });
});

describe('buildScene', () => {
  it('los puntos de llamada siguen el orden de las áreas', () => {
    const s = buildScene(DEMO_FEATURES);
    expect(s.callouts).toHaveLength(8);
    expect(s.callouts.map((c) => c.area)).toEqual(AREA_ORDER);
    s.callouts.forEach((c, i) => {
      expect(c.n).toBe(i + 1);
      expect(Number.isFinite(c.anchor.x)).toBe(true);
      expect(Number.isFinite(c.anchor.y)).toBe(true);
      expect(Number.isFinite(c.bubble.x)).toBe(true);
      expect(Number.isFinite(c.bubble.y)).toBe(true);
    });
  });

  it('los ids de las piezas son únicos', () => {
    for (const ft of [NONE, DEMO_FEATURES, ALL]) {
      const list = ids(buildScene(ft));
      expect(new Set(list).size).toBe(list.length);
    }
  });

  it('dibuja solo las piezas que el negocio tiene', () => {
    const none = ids(buildScene(NONE));
    const condicionales = [
      'camara', 'camara-vision', 'archivero', 'monitor', 'celular', 'huellero', 'moto',
      'nube', 'contador-edificio', 'ti-edificio', 'marketing-edificio',
      'persona-escritorio', 'persona-gondola',
    ];
    for (const id of condicionales) expect(none).not.toContain(id);

    const withFeature = (patch: Partial<SceneFeatures>) => ids(buildScene({ ...NONE, ...patch }));
    expect(withFeature({ camaras: true })).toContain('camara');
    expect(withFeature({ archivero: true })).toContain('archivero');
    expect(withFeature({ computadora: true })).toContain('monitor');
    expect(withFeature({ celular: true })).toContain('celular');
    expect(withFeature({ biometria: true })).toContain('huellero');
    expect(withFeature({ delivery: true })).toContain('moto');
    expect(withFeature({ nube: true })).toContain('nube');
    expect(withFeature({ contador: true })).toContain('contador-edificio');
    expect(withFeature({ ti: true })).toContain('ti-edificio');
    expect(withFeature({ marketing: true })).toContain('marketing-edificio');
    expect(withFeature({ equipo: 2 })).toContain('persona-escritorio');
    const eq3 = withFeature({ equipo: 3 });
    expect(eq3).toContain('persona-escritorio');
    expect(eq3).toContain('persona-gondola');

    for (const id of ['mostrador', 'aviso', 'cliente', 'persona-mostrador', 'cortina', 'router']) {
      expect(none).toContain(id);
    }
  });

  it('solo dibuja los flujos de datos que existen', () => {
    expect(buildScene(NONE).flows).toHaveLength(0);
    expect(flowIds(buildScene({ ...NONE, nube: true }))).toContain('flujo-nube');
    expect(flowIds(buildScene({ ...NONE, delivery: true }))).toContain('flujo-delivery');
    expect(flowIds(buildScene({ ...NONE, contador: true }))).toContain('flujo-contador');
  });

  it('nombra el lugar de cada área según lo que hay en el negocio', () => {
    const none = buildScene(NONE);
    expect(place(none, 'inventario')).toBe('Los papeles del escritorio');
    expect(place(none, 'licitud')).toBe('La libreta del mostrador');
    expect(place(none, 'seguridad')).toBe('La caja');
    expect(place(none, 'terceros')).toBe('El internet del local');
    expect(place(none, 'cultura')).toBe('Quien atiende');

    const demo = buildScene(DEMO_FEATURES);
    expect(place(demo, 'inventario')).toBe('El archivero');
    expect(place(demo, 'licitud')).toBe('El WhatsApp del negocio');
    expect(place(demo, 'seguridad')).toBe('La computadora');
    expect(place(demo, 'terceros')).toBe('La nube');

    expect(place(buildScene({ ...NONE, equipo: 2 }), 'cultura')).toBe('Tu equipo');
    expect(place(buildScene({ ...NONE, contador: true }), 'terceros')).toBe('El contador');
  });

  it('usa el encuadre común salvo que se pida el propio', () => {
    expect(buildScene(NONE).viewBox).toEqual(sceneFrame());
    expect(buildScene(DEMO_FEATURES).viewBox).toEqual(sceneFrame());
    const own = buildScene(DEMO_FEATURES, false).viewBox;
    const full = sceneFrame();
    expect(own[2]).toBeLessThanOrEqual(full[2]);
    expect(own[3]).toBeLessThanOrEqual(full[3]);
  });

  it('el dibujo es determinista', () => {
    expect(JSON.stringify(buildScene(DEMO_FEATURES))).toBe(JSON.stringify(buildScene(DEMO_FEATURES)));
  });

  it('el SVG no filtra datos ni valores inválidos', () => {
    for (const ft of [ALL, NONE]) {
      const scene = buildScene(ft);
      for (const item of scene.items) {
        expect(item.html).not.toContain('<script');
        expect(item.html).not.toContain('NaN');
        expect(item.html).not.toContain('undefined');
        expect(item.html).not.toContain('Infinity');
      }
      for (const flow of scene.flows) {
        expect(flow.html).not.toContain('<script');
        expect(flow.html).not.toContain('NaN');
        expect(flow.html).not.toContain('undefined');
        expect(flow.html).not.toContain('Infinity');
      }
    }
  });
});

describe('focusBox', () => {
  it('el encuadre de cerca cabe dentro del encuadre completo', () => {
    const scene = buildScene(DEMO_FEATURES);
    const full = scene.viewBox;
    for (const area of AREA_ORDER) {
      const box = focusBox(scene, area);
      expect(box[2]).toBeCloseTo(full[2] / 2);
      expect(box[3]).toBeCloseTo(full[3] / 2);
      expect(box[0]).toBeGreaterThanOrEqual(full[0] - 1e-6);
      expect(box[1]).toBeGreaterThanOrEqual(full[1] - 1e-6);
      expect(box[0] + box[2]).toBeLessThanOrEqual(full[0] + full[2] + 1e-6);
      expect(box[1] + box[3]).toBeLessThanOrEqual(full[1] + full[3] + 1e-6);
    }
  });
});

describe('tipos de negocio', () => {
  const TIPOS: Tipo[] = ['farmacia', 'fonda', 'salon', 'tienda', 'oficina'];

  it('featuresFromProfile conserva el tipo de negocio válido', () => {
    for (const tipo of TIPOS) {
      expect(featuresFromProfile({ tipo: [tipo] }).tipo).toBe(tipo);
    }
    expect(featuresFromProfile({ tipo: ['otro'] }).tipo).toBeUndefined();
    expect(featuresFromProfile({}).tipo).toBeUndefined();
  });

  it('cada tipo dibuja una escena completa y válida', () => {
    for (const tipo of TIPOS) {
      for (const base of [ALL, NONE]) {
        const scene = buildScene({ ...base, tipo });
        const list = ids(scene);
        expect(new Set(list).size).toBe(list.length);
        expect(scene.callouts).toHaveLength(8);
        scene.callouts.forEach((c, i) => {
          expect(c.n).toBe(i + 1);
          expect(c.area).toBe(AREA_ORDER[i]!);
        });
        for (const item of scene.items) {
          expect(item.html).not.toContain('NaN');
          expect(item.html).not.toContain('undefined');
          expect(item.html).not.toContain('Infinity');
          expect(item.html).not.toContain('<script');
        }
        for (const flow of scene.flows) {
          expect(flow.html).not.toContain('NaN');
          expect(flow.html).not.toContain('undefined');
          expect(flow.html).not.toContain('Infinity');
          expect(flow.html).not.toContain('<script');
        }
        for (const id of ['mostrador', 'aviso', 'cliente', 'persona-mostrador', 'cortina', 'sombras']) {
          expect(list).toContain(id);
        }
      }
    }
  });

  it('dibuja las piezas propias de cada tipo', () => {
    const fonda = ids(buildScene({ ...ALL, tipo: 'fonda' }));
    for (const id of ['estufa', 'menu', 'mesa-1', 'mesa-2', 'taburete-0']) expect(fonda).toContain(id);
    expect(fonda).not.toContain('gondola');

    const salon = ids(buildScene({ ...ALL, tipo: 'salon' }));
    for (const id of ['espejo-0', 'espejo-1', 'sillon-0', 'banca']) expect(salon).toContain(id);
    expect(salon).not.toContain('gondola');

    const tienda = ids(buildScene({ ...ALL, tipo: 'tienda' }));
    for (const id of ['gondola', 'gondola-2', 'nevera', 'nevera-2']) expect(tienda).toContain(id);

    const farmacia = ids(buildScene({ ...ALL, tipo: 'farmacia' }));
    for (const id of ['gondola', 'nevera', 'horario']) expect(farmacia).toContain(id);
    expect(farmacia).not.toContain('gondola-2');

    const oficina = ids(buildScene({ ...ALL, tipo: 'oficina' }));
    for (const id of ['diplomas', 'espera-0', 'mesita']) expect(oficina).toContain(id);
    expect(oficina).not.toContain('gondola');
    expect(oficina).not.toContain('nevera');
  });

  it('la finca es un lugar propio, sin local, con sus ocho puntos', () => {
    for (const base of [ALL, NONE]) {
      const scene = buildScene({ ...base, tipo: 'campo' });
      const list = ids(scene);
      expect(new Set(list).size).toBe(list.length);
      expect(scene.callouts).toHaveLength(8);
      for (const item of scene.items) {
        expect(item.html).not.toContain('NaN');
        expect(item.html).not.toContain('undefined');
        expect(item.html).not.toContain('Infinity');
      }
      for (const id of ['galera-techo', 'surco-0', 'tractor', 'puesto', 'arbol', 'marco-a', 'aviso', 'cliente', 'sombras']) expect(list).toContain(id);
      for (const id of ['mostrador', 'cortina', 'muro-izq', 'piso-trastienda']) expect(list).not.toContain(id);
      expect(scene.viewBox).toEqual(sceneFrame());
    }
    const places = buildScene({ ...NONE, tipo: 'campo' }).callouts.map((c) => c.place);
    expect(places).toContain('El portón');
    expect(places).toContain('El comprador');
  });

  it.each([
    ['taller', ['carro', 'elevador-postes', 'banco-trabajo', 'llantas', 'mostrador']],
    ['obra', ['losa', 'columnas', 'andamio', 'mezcladora', 'contenedor']],
    ['hospedaje', ['cama-a', 'cama-b', 'mostrador', 'casillero-llaves', 'sofa-base']],
    ['escuela', ['pupitre-0-0', 'estante', 'tabique-a', 'mostrador', 'bandera']],
    ['transporte', ['camion-cajon', 'rack-0', 'paleta', 'oficina-vidrio', 'mostrador']],
    ['casa', ['meseta', 'nevera', 'envios-0', 'sofa', 'reja', 'mostrador']],
    ['organizacion', ['estrado', 'podio', 'silla-0-0', 'ventilador-0', 'cafe', 'mostrador']],
  ] as [Tipo, string[]][])('%s es un lugar propio con sus ocho puntos', (tipo, propias) => {
    for (const base of [ALL, NONE]) {
      const scene = buildScene({ ...base, tipo });
      const list = ids(scene);
      expect(new Set(list).size).toBe(list.length);
      expect(scene.callouts).toHaveLength(8);
      for (const item of scene.items) expect(item.html).not.toMatch(/NaN|undefined|Infinity/);
      for (const id of [...propias, 'marco-a', 'aviso', 'cliente', 'persona-mostrador', 'sombras']) expect(list).toContain(id);
      expect(scene.viewBox).toEqual(sceneFrame());
    }
  });

  it('sin tipo se dibuja la tienda', () => {
    expect(ids(buildScene(ALL))).toEqual(ids(buildScene({ ...ALL, tipo: 'tienda' })));
  });

  it('la persona extra de sala aparece con equipo de 3', () => {
    const conPersona: Tipo[] = ['oficina', 'fonda', 'salon'];
    for (const tipo of conPersona) {
      expect(ids(buildScene({ ...ALL, tipo, equipo: 3 }))).toContain('persona-sala');
      expect(ids(buildScene({ ...ALL, tipo, equipo: 1 }))).not.toContain('persona-sala');
    }
  });

  it('el encuadre fijo no depende del tipo', () => {
    for (const tipo of TIPOS) {
      expect(buildScene({ ...ALL, tipo }).viewBox).toEqual(sceneFrame());
    }
  });
});
