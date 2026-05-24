# Guía de Desarrollo para IA (Presentación Modular)

Este documento es una guía estructurada para que cualquier asistente de Inteligencia Artificial entienda la arquitectura de este proyecto y sepa cómo interactuar con él sin romper la estructura modular.

## 🏗️ Arquitectura del Proyecto

El proyecto originalmente era un monolito, pero fue refactorizado para ser modular y escalable **sin usar frameworks ni bundlers (como Vite o Webpack)**. Utiliza Vanilla JS, CSS nativo (`@import`) y la API `fetch` para cargar componentes.

### Estructura de Directorios

```text
/
├── index.html           # Contenedor principal de la aplicación.
├── styles.css           # Archivo maestro de estilos (solo contiene reglas @import).
├── deck-stage.js        # Web Component <deck-stage> (Lógica core de la presentación, NO TOCAR a menos que sea necesario).
├── AI_GUIDE.md          # Este archivo.
├── js/
│   └── loader.js        # Script encargado de hacer el fetch de los slides e inyectarlos.
├── css/
│   ├── base.css         # Variables (:root), fuentes, reset y estilos globales de <deck-stage>.
│   ├── layouts.css      # Reglas de posicionamiento y estructura general.
│   ├── components.css   # Estilos de bloques, tarjetas, métricas y callouts reutilizables.
│   └── slides/          # Archivos CSS específicos para cada diapositiva (si lo requiere).
└── slides/              # Archivos HTML individuales para cada diapositiva.
```

---

## 📝 1. Cómo Añadir, Modificar o Eliminar Diapositivas (Slides)

El orden y carga de las diapositivas está dictaminado por Javascript, no por la estructura del `index.html`.

### Para Modificar una diapositiva existente:
1. Ve a la carpeta `slides/` y busca el archivo `.html` correspondiente.
2. Edita su contenido. Todas las diapositivas **deben** estar envueltas en una etiqueta `<section data-screen-label="Título">`.

### Para Crear una nueva diapositiva:
1. Crea un nuevo archivo en la carpeta `slides/` (ej. `slides/31-31-nueva-diapositiva.html`).
2. Añade la estructura base:
   ```html
   <section data-screen-label="Nuevo Slide">
       <div class="title-row">
           <div>
               <div class="eyebrow">05 · Nueva Sección</div>
               <h1 class="slide-title">Título del Slide</h1>
           </div>
       </div>
       <div class="slide-body">
           <!-- Contenido aquí -->
       </div>
   </section>
   ```
3. **Paso Crítico:** Debes registrar el nuevo archivo en `js/loader.js`.
   Abre `js/loader.js` y añade la ruta exacta al array `slideUrls` en la posición donde deseas que aparezca.

### Para Eliminar una diapositiva:
1. Elimina el archivo `.html` de la carpeta `slides/`.
2. Bórralo del array `slideUrls` en `js/loader.js`.

---

## 🎨 2. Cómo Manejar los Estilos (CSS)

El archivo `styles.css` en la raíz **NUNCA debe contener código CSS directo**, solo directivas `@import`.

### Para modificar estilos generales o reutilizables:
- **Colores, tipografías o fondos:** Edita `css/base.css`.
- **Estructuras de grilla (ej. `.col-2`, `.col-3`):** Edita `css/layouts.css` o `css/components.css`.
- **Tarjetas, Callouts, Etiquetas:** Edita `css/components.css`.

### Para añadir estilos específicos de una sola diapositiva:
1. Crea un archivo CSS en `css/slides/` (ej. `css/slides/nueva-diapositiva.css`).
2. Utiliza selectores específicos para no afectar otros slides (ej. `section[data-screen-label="Nuevo Slide"] .mi-clase { ... }`).
3. Importa este nuevo archivo en el `styles.css` de la raíz:
   ```css
   @import url("css/slides/nueva-diapositiva.css");
   ```

---

## ⚙️ 3. Lógica (Javascript) y Web Component

### El Componente `<deck-stage>`
La presentación funciona gracias al archivo `deck-stage.js`, que define el Custom Element `<deck-stage>`. Este script maneja:
- La navegación por teclado (flechas, espacio).
- El escalado responsivo de la diapositiva para que encaje en la pantalla.
- La barra lateral (rail) con las miniaturas de las diapositivas.
- Las transiciones y visibilidad (asigna opacidad 0 a las inactivas).

**Importante:** Las diapositivas (`<section>`) se inyectan en el *light DOM* de `<deck-stage>`, y el componente usa un `<slot>` para leerlas.

### Funcionalidad Personalizada
Si necesitas añadir scripts para un gráfico interactivo, un video, o interactividad específica dentro de un slide:
1. Pon la lógica en un archivo dentro de `js/` (ej. `js/charts.js`).
2. Expón funciones globales o usa un `MutationObserver` si necesitas inicializar scripts dinámicamente cuando el slide se hace visible. Recuerda que los slides se cargan por `fetch`, así que eventos como `DOMContentLoaded` pueden dispararse antes de que el slide esté en el DOM.
3. Importa tu script en `index.html` después de `loader.js`.

---

## ⚠️ Consideraciones de Entorno

Debido a que el proyecto usa `fetch()` local para inyectar los archivos HTML y directivas `@import` para el CSS, el proyecto **no puede ejecutarse haciendo doble clic sobre el archivo `index.html`** (protocolo `file:///`).
Siempre debes instruir al usuario a utilizar un Servidor Web Local (ej. Live Server en VS Code, o `python -m http.server`) para previsualizar los cambios, de lo contrario encontrará errores de CORS o recursos bloqueados.
