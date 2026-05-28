
const slideUrls = [
  "slides/01-portada.html",
  "slides/02-hoja-de-ruta.html",
  "slides/03-contexto.html",
  "slides/04-problema.html",
  "slides/05-marco-conceptual-i.html",
  "slides/06-marco-conceptual-ii.html",
  "slides/07-estado-del-arte.html",
  "slides/08-objetivos.html",
  "slides/09-metodologia-ciclos.html",
  "slides/10-datos-temporalidad.html",
  "slides/11-datos-i.html",
  "slides/12-datos-ii.html",
  "slides/13-variable-objetivo.html",
  "slides/14-variable-objetivo-versiones.html",
  "slides/15-seleccion-de-variables.html",
  "slides/16-modelado.html",
  "slides/17-dag-flujo.html",
  "slides/18-arquitectura-del-servicio.html",
  "slides/19-metricas.html",
  "slides/20-matriz-de-confusion.html",
  "slides/23-subgrupos.html",
  "slides/21-seleccion-modelo.html",
  "slides/22-resultados-shap.html",
  "slides/24-validacion-de-software.html",
  "slides/25-validacion-clinica.html",
  "slides/26-limitaciones.html",
  "slides/27-conclusiones.html",
  "slides/28-aporte-e-impacto.html",
  "slides/29-trabajo-futuro.html",
  "slides/30-cierre.html",
];

async function loadSlides() {
    const stage = document.querySelector('deck-stage');
    if (!stage) return;

    for (const url of slideUrls) {
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to load ' + url);
            const buf = await res.arrayBuffer();
            let html = new TextDecoder('utf-8').decode(buf);

            // Live Server inyecta su script de WebSocket dentro de los <svg>
            // al detectar contenido SVG. Eso corrompe el HTML cuando se parsea
            // con insertAdjacentHTML. Eliminamos todos los <script> inyectados
            // antes de insertar para que el parser no se pierda.
            html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi, '');

            stage.insertAdjacentHTML('beforeend', html);
        } catch (error) {
            console.error(error);
        }
    }

    // Notificar que todos los slides han sido inyectados (para Lucide u otros)
    document.dispatchEvent(new CustomEvent('slides-loaded'));
}

document.addEventListener('DOMContentLoaded', loadSlides);
