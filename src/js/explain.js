import d3 from 'd3';
import Reveal from 'reveal.js';
import './ternary.v3';
import '../../node_modules/reveal_external/external/external';
import Reveald3 from '../../node_modules/reveald3/reveald3';

document.addEventListener('DOMContentLoaded', (event) => {
/**
 * reveal.js plugin to integrate d3.js visualizations into slides and trigger transitions supporting data-fragment-index
 */
  window.Reveal = Reveal; // plugins need that
  window.Reveald3 = Reveald3;

  Reveal.initialize({
    controls: true,
    progress: true,
    history: false,
    center: false,
    touch: true,
    transition: 'fade',
  });

  Reveal.configure({
    external: {
      async: false,
    },

    reveald3: {
      runLastState: true, // default true
      keepIframe: false, // default: false
      mapPath: false, // default: false
      tryFallbackURL: false, // default false
    },
  });
});
