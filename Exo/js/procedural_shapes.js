// =============================================================================
// PROCEDURAL_SHAPES.JS - Definiciones de Todas las Formas Procedurales
// =============================================================================

// =============================================================================
// CUERPOS DE CRIATURAS
// =============================================================================

const BODY_QUADRUPED = [
    // Cuerpo principal
    { type: 'ellipse', x: 0, y: 0, radiusX: 20, radiusY: 12, baseColor: 'medium' },
    // Articulaciones
    { type: 'circle', x: -12, y: -8, radius: 4, baseColor: 'dark' },  // Hombro izq
    { type: 'circle', x: 12, y: -8, radius: 4, baseColor: 'dark' },   // Hombro der
    { type: 'circle', x: -12, y: 8, radius: 4, baseColor: 'dark' },   // Cadera izq
    { type: 'circle', x: 12, y: 8, radius: 4, baseColor: 'dark' },    // Cadera der
    // Cola
    { type: 'line', x1: -20, y1: 0, x2: -28, y2: -4, thickness: 3, baseColor: 'medium' }
];

const BODY_BIPEDAL = [
    // Torso vertical
    { type: 'ellipse', x: 0, y: 0, radiusX: 10, radiusY: 16, baseColor: 'medium' },
    // Hombros
    { type: 'circle', x: -8, y: -12, radius: 3, baseColor: 'dark' },
    { type: 'circle', x: 8, y: -12, radius: 3, baseColor: 'dark' },
    // Caderas
    { type: 'circle', x: -6, y: 12, radius: 4, baseColor: 'dark' },
    { type: 'circle', x: 6, y: 12, radius: 4, baseColor: 'dark' }
];

const BODY_SERPENTINE = [
    // Segmentos de serpiente
    { type: 'ellipse', x: 0, y: 0, radiusX: 8, radiusY: 6, baseColor: 'medium' },
    { type: 'ellipse', x: -10, y: 0, radiusX: 7, radiusY: 5, baseColor: 'medium' },
    { type: 'ellipse', x: -18, y: 2, radiusX: 6, radiusY: 4, baseColor: 'medium' },
    { type: 'ellipse', x: -24, y: 4, radiusX: 5, radiusY: 3, baseColor: 'medium' },
    { type: 'ellipse', x: -28, y: 6, radiusX: 4, radiusY: 2, baseColor: 'dark' }
];

const BODY_AQUATIC = [
    // Cuerpo hidrodinámico
    { type: 'ellipse', x: 0, y: 0, radiusX: 18, radiusY: 10, baseColor: 'medium' },
    // Aleta dorsal
    { type: 'polygon', points: [{ x: 0, y: -10 }, { x: 2, y: -18 }, { x: -2, y: -18 }], baseColor: 'dark' },
    // Aleta caudal
    { type: 'polygon', points: [{ x: -18, y: -4 }, { x: -24, y: 0 }, { x: -18, y: 4 }], baseColor: 'dark' }
];

const BODY_AERIAL = [
    // Cuerpo ligero
    { type: 'ellipse', x: 0, y: 0, radiusX: 12, radiusY: 8, baseColor: 'light' },
    // Puntos de anclaje de alas
    { type: 'circle', x: -8, y: 0, radius: 3, baseColor: 'dark' },
    { type: 'circle', x: 8, y: 0, radius: 3, baseColor: 'dark' }
];

// =============================================================================
// CABEZAS
// =============================================================================

const HEAD_HERBIVORE = [
    // Cabeza ancha
    { type: 'ellipse', x: 0, y: 0, radiusX: 10, radiusY: 8, baseColor: 'medium' },
    // Hocico
    { type: 'rect', x: 8, y: 0, w: 8, h: 6, baseColor: 'light' },
    // Ojos laterales
    { type: 'circle', x: 2, y: -4, radius: 2, baseColor: 'black' },
    { type: 'circle', x: 2, y: 4, radius: 2, baseColor: 'black' }
];

const HEAD_CARNIVORE = [
    // Cabeza alargada
    { type: 'ellipse', x: 0, y: 0, radiusX: 12, radiusY: 7, baseColor: 'medium' },
    // Mandíbula
    { type: 'rect', x: 10, y: 0, w: 8, h: 5, baseColor: 'dark' },
    // Dientes
    { type: 'line', x1: 14, y1: -2, x2: 14, y2: -4, thickness: 1, baseColor: 'white' },
    { type: 'line', x1: 16, y1: 2, x2: 16, y2: 4, thickness: 1, baseColor: 'white' },
    // Ojos frontales
    { type: 'circle', x: 4, y: -3, radius: 2, baseColor: 'black' },
    { type: 'circle', x: 4, y: 3, radius: 2, baseColor: 'black' }
];

const HEAD_OMNIVORE = [
    // Cabeza balanceada
    { type: 'ellipse', x: 0, y: 0, radiusX: 10, radiusY: 7, baseColor: 'medium' },
    // Hocico corto
    { type: 'rect', x: 8, y: 0, w: 6, h: 5, baseColor: 'light' },
    // Ojos centrados
    { type: 'circle', x: 3, y: -3, radius: 2, baseColor: 'black' },
    { type: 'circle', x: 3, y: 3, radius: 2, baseColor: 'black' }
];

const HEAD_FILTER = [
    // Boca grande circular
    { type: 'circle', x: 0, y: 0, radius: 10, baseColor: 'medium' },
    // Boca abierta
    { type: 'circle', x: 8, y: 0, radius: 6, baseColor: 'dark' },
    // Barbas
    { type: 'line', x1: 0, y1: 8, x2: -2, y2: 14, thickness: 2, baseColor: 'medium' },
    { type: 'line', x1: 0, y1: -8, x2: -2, y2: -14, thickness: 2, baseColor: 'medium' }
];

// =============================================================================
// EXTREMIDADES
// =============================================================================

const LIMB_LEG_FRONT = [
    // Muslo
    { type: 'rect', x: 0, y: 0, w: 4, h: 10, baseColor: 'medium' },
    // Articulación
    { type: 'circle', x: 0, y: 10, radius: 3, baseColor: 'dark' },
    // Parte baja
    { type: 'rect', x: 0, y: 16, w: 3, h: 8, baseColor: 'medium' },
    // Pata
    { type: 'rect', x: 0, y: 22, w: 5, h: 2, baseColor: 'dark' }
];

const LIMB_LEG_BACK = [
    // Muslo más grueso
    { type: 'rect', x: 0, y: 0, w: 5, h: 12, baseColor: 'medium' },
    // Articulación
    { type: 'circle', x: 0, y: 12, radius: 3, baseColor: 'dark' },
    // Parte baja
    { type: 'rect', x: 0, y: 18, w: 3, h: 10, baseColor: 'medium' },
    // Pata
    { type: 'rect', x: 0, y: 26, w: 6, h: 2, baseColor: 'dark' }
];

const LIMB_FIN = [
    // Aleta en forma de paleta
    { type: 'ellipse', x: 0, y: 0, radiusX: 3, radiusY: 12, baseColor: 'medium' },
    // Membrana
    { type: 'polygon', points: [{ x: 0, y: -12 }, { x: 4, y: -6 }, { x: 4, y: 6 }, { x: 0, y: 12 }], baseColor: 'light' }
];

const LIMB_WING = [
    // Brazo del ala
    { type: 'rect', x: 0, y: 0, w: 3, h: 12, baseColor: 'medium' },
    // Membrana del ala
    {
        type: 'polygon', points: [
            { x: 0, y: 0 },
            { x: 20, y: -8 },
            { x: 24, y: 0 },
            { x: 20, y: 8 }
        ], baseColor: 'light'
    },
    // Huesos del ala
    { type: 'line', x1: 0, y1: 0, x2: 20, y2: -8, thickness: 1, baseColor: 'dark' },
    { type: 'line', x1: 0, y1: 0, x2: 20, y2: 8, thickness: 1, baseColor: 'dark' }
];

const LIMB_TENTACLE = [
    // Segmentos flexibles
    { type: 'circle', x: 0, y: 0, radius: 3, baseColor: 'medium' },
    { type: 'circle', x: 0, y: 6, radius: 2.5, baseColor: 'medium' },
    { type: 'circle', x: 1, y: 11, radius: 2, baseColor: 'medium' },
    { type: 'circle', x: 2, y: 15, radius: 1.5, baseColor: 'medium' },
    // Ventosas
    { type: 'circle', x: -1, y: 4, radius: 1, baseColor: 'dark' },
    { type: 'circle', x: -1, y: 9, radius: 1, baseColor: 'dark' }
];

// =============================================================================
// ACCESORIOS
// =============================================================================

const ACCESSORY_HORN = [
    { type: 'polygon', points: [{ x: 0, y: 0 }, { x: -2, y: -12 }, { x: 2, y: -12 }], baseColor: 'dark' }
];

const ACCESSORY_SPINES = [
    { type: 'line', x1: 0, y1: 0, x2: -2, y2: -6, thickness: 2, baseColor: 'dark' },
    { type: 'line', x1: 4, y1: 0, x2: 2, y2: -5, thickness: 2, baseColor: 'dark' },
    { type: 'line', x1: 8, y1: 0, x2: 6, y2: -6, thickness: 2, baseColor: 'dark' }
];

const ACCESSORY_DORSAL_FIN = [
    { type: 'polygon', points: [{ x: 0, y: 0 }, { x: 2, y: -10 }, { x: -2, y: -10 }], baseColor: 'medium', stroke: true, strokeColor: 'dark' }
];

// =============================================================================
// FLORA
// =============================================================================

const FLORA_TREE = [
    // Tronco
    { type: 'rect', x: 0, y: 0, w: 6, h: 30, baseColor: 'dark' },
    // Copa
    { type: 'circle', x: 0, y: -25, radius: 20, baseColor: 'medium' },
    { type: 'circle', x: -8, y: -22, radius: 14, baseColor: 'medium' },
    { type: 'circle', x: 8, y: -22, radius: 14, baseColor: 'medium' }
];

const FLORA_BUSH = [
    // Grupo de círculos para follaje
    { type: 'circle', x: 0, y: 0, radius: 12, baseColor: 'medium' },
    { type: 'circle', x: -6, y: -4, radius: 8, baseColor: 'medium' },
    { type: 'circle', x: 6, y: -4, radius: 8, baseColor: 'medium' },
    { type: 'circle', x: 0, y: -8, radius: 6, baseColor: 'light' }
];

const FLORA_GRASS = [
    // Hierbas onduladas
    { type: 'line', x1: 0, y1: 0, x2: -2, y2: -8, thickness: 2, baseColor: 'medium' },
    { type: 'line', x1: 2, y1: 0, x2: 1, y2: -10, thickness: 2, baseColor: 'medium' },
    { type: 'line', x1: 4, y1: 0, x2: 6, y2: -7, thickness: 2, baseColor: 'medium' }
];

const FLORA_CORAL = [
    // Estructura ramificada
    { type: 'rect', x: 0, y: 0, w: 4, h: 12, baseColor: 'medium' },
    { type: 'rect', x: -6, y: -6, w: 3, h: 10, baseColor: 'medium' },
    { type: 'rect', x: 6, y: -6, w: 3, h: 10, baseColor: 'medium' },
    { type: 'circle', x: -6, y: -12, radius: 4, baseColor: 'light' },
    { type: 'circle', x: 0, y: -14, radius: 5, baseColor: 'light' },
    { type: 'circle', x: 6, y: -12, radius: 4, baseColor: 'light' }
];

// =============================================================================
// EFECTOS ESPECIALES
// =============================================================================

const EFFECT_SHADOW = [
    { type: 'ellipse', x: 0, y: 0, radiusX: 15, radiusY: 6, baseColor: 'rgba(0,0,0,0.3)' }
];

const EFFECT_FIRE_PARTICLE = [
    { type: 'circle', x: 0, y: 0, radius: 3, baseColor: 'rgba(255,100,0,0.8)' },
    { type: 'circle', x: 0, y: 0, radius: 2, baseColor: 'rgba(255,200,0,0.9)' }
];

const EFFECT_ICE_PARTICLE = [
    { type: 'rect', x: 0, y: 0, w: 4, h: 4, baseColor: 'rgba(150,200,255,0.7)' },
    { type: 'pixel', x: 1, y: 1, color: 'rgba(255,255,255,0.9)' }
];

const EFFECT_POISON_PARTICLE = [
    { type: 'circle', x: 0, y: 0, radius: 2, baseColor: 'rgba(100,255,100,0.6)' }
];
