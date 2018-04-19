/* global Reveal */

var pt = pt || {};

pt.handleEvent = function(isSlideEvent) {
  'use strict';

  let currentSlideId = Reveal.getCurrentSlide().id;
  let currentFragment = Reveal.getIndices().f;

  // Don't go any further if the slide has no ID (i.e. the string is empty).
  if (!currentSlideId) {
    return;
  }

  //First remove any SVGs still present when changing a slide
  if (isSlideEvent) removeSVGs(); // ?????

  // If there is no entry corresponding to the current slide in the map, don't go further.
  let functions = pt.slideIdToFunctions[currentSlideId];
  if (functions == null) return;

  // Call the init function when arriving on a slide for the first time.
  if (isSlideEvent) {
    let initFunction = functions.init;
    if (initFunction != null) {
      initFunction();
      // Make sure we don't call the init function again.
      //functions.init = null;
    }//if
  }//if

  let fragmentFunction = functions[currentFragment];
  if (fragmentFunction != null) fragmentFunction();
};

pt.handleSlideEvent = function() {
  'use strict';
  //Remove all the svg's drawn
  //pt.selectAll("svg").remove();
  pt.handleEvent(true);
};

pt.handleFragmentEvent = function() {
  'use strict';
  pt.handleEvent(false);
};

Reveal.addEventListener('slidechanged', pt.handleSlideEvent);

Reveal.addEventListener('fragmentshown', pt.handleFragmentEvent);

Reveal.addEventListener('fragmenthidden', pt.handleFragmentEvent);
