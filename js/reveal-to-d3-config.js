/* global d3 */

var pt = pt || {};

pt.slideIdToFunctions = {
  'cleanTernaryPlot': {
    'init': function() {
      pt.ternaryPlot.init();
    }
  },
  'addLabels': {
    0: function() {
      pt.ternaryPlot.addLabels(['Sand']);
    },
    1: function() {
      pt.ternaryPlot.addLabels(['Sand', 'Silt']);
    },
    2: function() {
      pt.ternaryPlot.addLabels(['Sand', 'Silt', 'Clay']);
    }    
  },
  'intro-shopperdna': {
    'init': function() {
      pt.ternaryPlot.init();
    }
  },
  'shopperdna-color-intro': {
    'init': function() {
      pt.ternaryPlot.init();
    }
  },
  'shopperdna-colors': {
    '-1': function() {
      pt.ternaryPlot.updateTitle("Dark rainbow","without red");
    },
    0: function() {
      pt.ternaryPlot.updateTitle("Pastel rainbow","nope...");
    },
    1: function() {
      pt.ternaryPlot.updateTitle("Earthy","but re-using the red doesn't work");
    },
    2: function() {
      pt.ternaryPlot.updateTitle("Alternating blue green","final choice before merchant testing");
    },
    3: function() {
      pt.ternaryPlot.updateTitle("All blue","didn't have to be distinguishable");
    }
  },
  'intro-organogram': {
    'init': function() {
      pt.organogramIntro.init(graph);
    }
  },
  'org-tree-network': {
    'init': function() {
      pt.orgTreeNetwork.init(graph);
    },
    '-1': function() {
      pt.orgTreeNetwork.treeNetwork();
    },
    0: function() {
      pt.orgTreeNetwork.normalNetwork();
    }
  },
  'org-final-result': {
    'init': function() {
      setTimeout(function() {
      	pt.orgInteractivity.init(employees)
      }, 500);
    }
  },
  'org-interactivity': {
    'init': function() {
      pt.orgInteractivity.init(employees)
    }
  },
  'intro-voronoi': {
    'init': function() {
      pt.voronoiIntro.init();
    }
  },
  'voronoi-scatter-plot': {
    'init': function() {
      pt.voronoiScatterPlot.init(countries);
    },
    '-1': function() {
      pt.voronoiScatterPlot.setNoTooltip();
    },
    0: function() {
      pt.voronoiScatterPlot.setTooltipCircle();
    },
    1: function() {
      pt.voronoiScatterPlot.setTooltipVoronoi();
    },
    2: function() {
      pt.voronoiScatterPlot.setTooltipVoronoiCircle();
    },
    3: function() {
      pt.voronoiScatterPlot.removeVoronoiStroke();
    },
    4: function() {
      pt.voronoiScatterPlot.setTooltipVoronoiOuterCircle();
    },
    5: function() {
      pt.voronoiScatterPlot.setTooltipFinal();
    }
  },
  'intro-baby-names': {
    'init': function() {
      pt.babyNamesIntro.init();
    }
  },
  'voronoi-baby-names': {
    'init': function() {
      pt.babyNames.init("voronoi-baby-names", girls);
    },
    '-1': function() {
      pt.babyNames.hideCells();
    },
    0: function() {
      pt.babyNames.showCells();
    },
    1: function() {
      pt.babyNames.hideCells();
    },
  },
  'baby-names-early-concept': {
    '-1': function() {
      pt.babyNamesEarlyConcept.updateTitle("Very first result in screen");
    },
    0: function() {
      pt.babyNamesEarlyConcept.updateTitle("Rainbow phase");
    },
    1: function() {
      pt.babyNamesEarlyConcept.updateTitle("Beyond the top 10");
    }
  },
  'brush-baby-names': {
    'init': function() {
      pt.babyNames.init("brush-baby-names", girls);
    }
  },
  'intro-brush': {
    'init': function() {
      pt.brushIntro.init();
    }
  },
  'brush-bar-update-data': {
    'init': function() {
      pt.brushBarUpdateData.init(movies);
    }
  },
  'brush-bar-clip-data': {
    'init': function() {
      pt.brushBarClipData.init(movies);
    }
  },
  'intro-stretched-chord': {
    'init': function() {
      pt.stretchedChordIntro.init();
    }
  },
  'sankey-example': {
    'init': function() {
      pt.sankey.init();
    }
  },
  'basic-chord-diagram': {
    'init': function() {
      pt.basicChordDiagram.init();
    },
    '-1': function() {
      pt.basicChordDiagram.resetOpacities();
    },
    0: function() {
      pt.basicChordDiagram.showBrown();
    },
    1: function() {
      pt.basicChordDiagram.showBrowntoBlond();
    },
    2: function() {
      pt.basicChordDiagram.showBlond();
    },
    3: function() {
      pt.basicChordDiagram.resetOpacities();
    },
  },
  'stretched-chord-steps': {
    'init': function() {
      pt.stretchedChord.init();
    },
    '-1': function() {
      pt.stretchedChord.step1();
    },
    0: function() {
      pt.stretchedChord.step2();
    },
    1: function() {
      pt.stretchedChord.step3();
    },
    2: function() {
      pt.stretchedChord.step4();
    },
    3: function() {
      pt.stretchedChord.step5();
    },
    4: function() {
      pt.stretchedChord.step6();
    },
    5: function() {
      pt.stretchedChord.step7();
    },
    6: function() {
      pt.stretchedChord.batplot();
    }
  },
  'stretched-chord-final': {
    'init': function() {
      pt.stretchedChordFinal.init();
    },
    '-1': function() {
      pt.stretchedChordFinal.greyChords();
    },
    0: function() {
      pt.stretchedChordFinal.animatedChords();
    }
  },
  'stretched-chord-imperfections': {
    '-1': function() {
      pt.stretchedChordImperfections.updateTitle("Dummy arcs","still there");
    },
    0: function() {
      pt.stretchedChordImperfections.updateTitle("Data","very specific set-up");
    }
  },
  'intro-loom': {
    'init': function() {
      pt.loomIntro.init();
    }
  },
  'loom-pull-to-middle': {
    'init': function() {
      pt.loomPullToMiddle.init();
    },
    '-1': function() {
      pt.loomPullToMiddle.normalChord();
    },
    0: function() {
      pt.loomPullToMiddle.adjustedChord();
    },
    1: function() {
      pt.loomPullToMiddle.adjustedArc();
    }
  },
  'loom-first-steps': {
    '-1': function() {
      pt.loomFirstSteps.updateTitle("Apply correct data","the LotR word counts");
    },
    0: function() {
      pt.loomFirstSteps.updateTitle("Pull center apart","one row per Fellowship member");
    },
    1: function() {
      pt.loomFirstSteps.updateTitle("Reduce overlap","sort the inner strings by Fellowship member");
    }
  },
  'loom-pull-apart': {
    '-1': function() {
      pt.loomPullApart.showImage();
    },
    0: function() {
      pt.loomPullApart.hideImage();
    }
  },
  'loom-lotr-final': {
    'init': function() {
      pt.loomLotRFinal.init(lotr);
    }
  },
  'project-slider-final': {
    'init': function() {
      pt.projectSlider.init("project-slider-final");
    }
  },
};

function removeSVGs() {


}//removeSVGs
