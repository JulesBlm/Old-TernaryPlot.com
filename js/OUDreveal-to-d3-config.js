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
    },
    3: function() {
      pt.ternaryPlot.addValueBox({'Sand': 0, 'Silt':0, 'Clay':0 });
    },
    4: function() {
      pt.ternaryPlot.updateValueBox({'Sand': 0, 'Silt':0, 'Clay':0 });
    }    
  },
  'axes': {
    0: function() {
      pt.ternaryPlot.markAxes();
    }
  }
};

function removeSVGs() {


}//removeSVGs
