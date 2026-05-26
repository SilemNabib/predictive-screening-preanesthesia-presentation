
const slideUrls = [
  "slides/01-01-portada.html",
  "slides/02-02-hoja-de-ruta.html",
  "slides/03-03-contexto.html",
  "slides/04-04-problema.html",
  "slides/05-05-marco-conceptual-i.html",
  "slides/06-06-marco-conceptual-ii.html",
  "slides/07-07-estado-del-arte.html",
  "slides/08-08-objetivos.html",
  "slides/10-10-metodolog-a---ciclos.html",      // fusionado: 09+10
  "slides/11-11-datos-i.html",
  "slides/12-12-datos-ii.html",
  "slides/15-15-variable-objetivo.html",
  "slides/16-16-variable-objetivo---versiones.html",
  "slides/17-17-selecci-n-de-variables.html",
  "slides/18-18-modelado.html",
  "slides/13-13-dag---flujo.html",               // fusionado: 13+14
  "slides/19-19-arquitectura-del-servicio.html", // fusionado: 19+20 (manifiesto integrado)
  "slides/21-21-m-tricas.html",
  "slides/22-22-matriz-de-confusi-n.html",
  "slides/23-23-subgrupos.html",
  "slides/25b-seleccion-modelo.html",             // frontend: selección dominio + tabla de modelos
  "slides/25c-resultados-shap.html",             // frontend: resultado calibrado + explicabilidad SHAP
  "slides/24-24-validaci-n-de-software.html",
  "slides/25-25-validaci-n-cl-nica.html",
  "slides/26-26-limitaciones.html",
  "slides/27-27-conclusiones.html",
  "slides/28-28-aporte-e-impacto.html",
  "slides/29-29-trabajo-futuro.html",
  "slides/30-30-cierre.html"
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
