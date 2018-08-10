import d3 from "d3";
import reveal from "reveal.js";
import './ternary.v3';

Reveal.initialize({
    controls: true,
    progress: true,
    history: false,
    center: false,
    touch: true,
    transition: 'fade',
    // optional configurations for reveald3
    reveald3: {
         // If the previous slide is a slide further in the deck (i.e. we come back to
         // slide from the next slide), by default the last fragment transition will be
         // triggered to to get the last state of the visualization and simulate the
         // the state the simulation was in when we left the slide. This can be
         // discarded.
         runLastState: true, //default true
         // Specifies if iframes (that host the visualization) have to be kept
         // on the slide once the slide is not active anymore (e.g.: navigating
         // to next slide). If true, the current visualization will be kept
         // active so that its state will be the one displayed if we navigate
         // back to the slide. This is false by default, as it can be the source
         // of performance issues if complex visualizations (e.g. force layout)
         // are displayed and kept in the background.
         // Also, see the runLastState option as a simpler less
         // resource-demanding alternative.
         keepIframe: false, // default: false
         // This will prefix the path attributes of the source html paths with the given path.
         // (by default "src" if set to true or with the specified path if string)
         mapPath: false, // default: false
         // If true, will try to locate the file at a fallback url without the mapPath prefix in case no file is found
         // at the stipulated url with mapPath
         tryFallbackURL: false, //default false
    },
    // Reveal.js plugins
    dependencies: [ { src: 'js/reveald3.js' }]
});
