# God Simulator - Cadena Trófica

Simulador de ecosistema donde controlas un mundo con diferentes biomas, plantas y criaturas que evolucionan mediante genética hereditaria.

## Estructura del Proyecto

```
LikeaGOD/
├── index.html              # Versión con módulos ES6 (requiere servidor)
├── standalone.html         # Versión standalone (funciona sin servidor)
├── game-bundle.js          # Todo el código en un archivo
├── style.css              # Estilos CSS
└── src/                   # Código fuente modular
    ├── main.js
    ├── core/
    │   ├── Game.js        # Loop principal del juego
    │   ├── EventBus.js    # Sistema de eventos
    │   └── TimeSystem.js  # Sistema de tiempo (5s = 1 día)
    ├── world/
    │   ├── World.js       # Gestión del mundo y grid
    │   └── Biome.js       # Definición de biomas
    ├── entities/
    │   ├── Entity.js      # Clase base
    │   ├── Plant.js       # Plantas
    │   ├── Creature.js    # Criaturas
    │   └── Genetics.js    # Sistema genético
    └── ui/
        └── UI.js          # Interfaz de usuario
```

## Cómo Ejecutar

### Opción 1: Standalone (Recomendada)
Abre directamente `standalone.html` en tu navegador. No requiere servidor web.

### Opción 2: Con módulos ES6
Necesitas un servidor web local debido a políticas CORS:

**Con Python:**
```bash
python -m http.server 8000
```

**Con Node.js:**
```bash
npx http-server
```

Luego abre `http://localhost:8000/index.html`

## Características

### Biomas (5 tipos)
- **Tundra**: Frío, baja producción de comida
- **Montaña**: Rocoso, producción media
- **Bosque**: Rica en vida, alta producción
- **Desierto**: Árido, baja producción
- **Mar**: Mundo acuático, producción alta

### Criaturas
- **Herbívoros** (verde): Comen plantas
- **Carnívoros** (rojo): Cazan otras criaturas
- **Omnívoros** (naranja): Comen ambos

### Sistema Genético
7 rasgos hereditarios:
- Adaptabilidad
- Ataque
- Defensa
- Velocidad
- Camuflaje
- Reproducción
- Aprendizaje

### Poderes de Dios
- 🌧️ **Lluvia**: Acelera crecimiento de plantas
- ☄️ **Meteoro**: Elimina 20% de entidades
- ⏸️/▶️/⏩/⏭️ **Control de Tiempo**: Pausa, x1, x2, x5

## Controles

- Los poderes se activan con los botones en el panel derecho
- Las estadísticas de población aparecen en el panel izquierdo
- El tiempo se actualiza cada 5 segundos reales = 1 día del juego

## Mecánicas

- Las criaturas **deambulan**, **buscan comida** o **buscan pareja** según su energía
- La **reproducción** combina genes de ambos padres con posibilidad de mutación
- La **hambre** mata a las criaturas si no comen durante 3 días
- Las plantas crecen de forma procedural según el bioma

¡Disfruta jugando a ser Dios! 🌍
