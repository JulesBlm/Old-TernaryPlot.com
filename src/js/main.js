/* eslint-disable no-eval */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-sparse-arrays */
// when updated to d3 v5 only import d3.svg, d3.select, d3.scale, d3.dispatch, d3.sum is all we need
import d3 from 'd3';
import Handsontable from 'handsontable';
import swal from 'sweetalert';
// import './ternary.v3';
import { Draw, Parse, clearLabels } from './DrawParse';

import '../css/style.scss';
import 'handsontable/dist/handsontable.full.min.css';

// Don't show intro popup within 2 days of a visit
if (document.cookie.split(';').filter(item => item.includes('visited=true')).length) {
  document.querySelector('#intro').remove(); // style = 'visibility: hidden; opacity: 0;transition: visibility 0s linear 0.15s, opacity 0.15s linear';
} else {
  const removeIntroButton = document.getElementById('closeIntro');
  removeIntroButton.addEventListener('click', () => {
    removeIntroButton.parentElement.remove();
  });

  const now = new Date();
  now.setDate(now.getDate() + 2);
  document.cookie = `visited=true;expires=${now}`;
}

function clear(className) {
  d3.selectAll(className).remove();
}

function clearAll() {
  clear('.ternary-line,.ternary-area,.point');
  clearLabels();
}

// Function to make empty cells grey
function emptyCellRenderer(instance, td, row, col, prop, value) { // cellProperties
  Handsontable.renderers.TextRenderer.apply(this, arguments); //

  if (value === null || value === '') {
    td.style.background = '#efefef';
  }
}

const initialTableSize = (window.innerWidth > 500) ? 500 : window.innerWidth - 20;

// maps function to lookup string
Handsontable.renderers.registerRenderer('emptyCellRenderer', emptyCellRenderer);

function createHandsOnTable(ID, placeholder, HOTcolumns) {
  return new Handsontable(document.getElementById(ID), {
    colHeaders: placeholder,
    columns: HOTcolumns,
    fixedRowsTop: 1,
    // manualColumnMove: true,
    manualRowMove: true,
    rowHeaders: true,
    minRows: 60,
    height: 330,
    width: initialTableSize,
    dropdownMenu: true,
    manualColumnResize: true,
    licenseKey: 'non-commercial-and-evaluation',
    cells() { // row, col
      const cellProperties = {};
      // const data = this.instance.getData();
      cellProperties.renderer = 'emptyCellRenderer'; // uses lookup map
      return cellProperties;
    },
    afterChange() {
      const storageKey = ID;
      if (this.getData()[0][0]) { localStorage[storageKey] = JSON.stringify(this.getData()); }
    },
  });
}


const pointColumns = [
  { type: 'numeric' },
  { type: 'numeric' },
  { type: 'numeric' },
  {},
  {
    type: 'dropdown',
    source: ['circle', 'cross', 'diamond', 'triangle-down', 'triangle-up'],
  },
  { type: 'numeric' },
  { type: 'numeric' },
  {},
];


const pointsPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Shape', 'Size', 'Opacity', 'Title'];
const pointsLabels = pointsPlaceholder.slice(0, 3);

const pointsTable = createHandsOnTable('pointsTable', pointsLabels, pointColumns);
const submitPointsButton = document.enterPoints;

Handsontable.dom.addEvent(submitPointsButton, 'submit', (e) => {
  e.preventDefault();
  clear('.point');

  const parsedPoints = Parse.Points(pointsTable.getData());
  Draw.Points(parsedPoints);
});

const linesPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Linestyle', 'Strokewidth', 'Title'];
const linesLabels = linesPlaceholder.slice(0, 3);

const linesColumns = [
  { type: 'numeric' },
  { type: 'numeric' },
  { type: 'numeric' },
  {},
  {
    type: 'dropdown',
    source: ['dotted', 'dot-dash', 'dot-dot-dash', 'short-dashed', 'medium-dashed', 'long-dashed'],
  },
  { type: 'numeric' },
  {},
];

const linesTable = createHandsOnTable('linesTable', linesLabels, linesColumns);
const submitLinesButton = document.enterLines;
Handsontable.dom.addEvent(submitLinesButton, 'submit', (e) => {
  e.preventDefault();
  clear('.ternary-line');
  const parsedLines = Parse.LinesAreas(linesTable.getData());
  Draw.Lines(parsedLines);
});

const areasPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Opacity', 'Title'];
const areaLabels = areasPlaceholder.slice(0, 3);

const areasColumns = [
  { type: 'numeric' },
  { type: 'numeric' },
  { type: 'numeric' },
  {},
  { type: 'numeric' },
  {},
];

const areasTable = createHandsOnTable('areasTable', areaLabels, areasColumns);
const submitAreasButton = document.enterAreas;
Handsontable.dom.addEvent(submitAreasButton, 'submit', (e) => {
  e.preventDefault();
  clear('.ternary-area');
  const parsedAreas = Parse.LinesAreas(areasTable.getData());
  Draw.Areas(parsedAreas);
});

let pointsData = [
  ['1. Sand', '2. Silt', '3. Clay', 'Color', 'Shape', 'Size', 'Opacity', 'Title'],
  [0.3, 0.3, 0.4, 'limegreen', , , 1, 'Sample Nr 1'],
  [1, 0, 0],
  [0, 1, 0],
  [0, 0, 1],
  [0.2, 0.5, 0.3, 'coral',, 800, 0.5, 'Half opacity big point'],
  [0.3, 0.1, 0.6, 'magenta', 'cross'],
  [0.5, 0.5, 0, '#d1b621', 'diamond'],
  [0.6, 0.2, 0.2, 'peru', 'triangle-up'],
];

let linesData = [
  ['1. Sand', '2. Silt', '3. Clay', 'Color', 'Linestyle', 'Strokewidth', 'Title'],
  [0.2, 0.8, 0, 'orangered', 'dot-dash', 2, 'Dotted line #1'],
  [0.8, 0, 0.2],
  [],
  [0.1, 0.1, 0.8, 'slateblue'],
  [0.4, 0.1, 0.5],
  [0, 0, 1],
];

let areasData = [
  ['1. Sand', '2. Silt', '3. Clay', 'Color', 'Opacity', 'Title'],
  [0, 0.5, 0.5, 'palegreen', 0.1, 'More than 50% silt'],
  [0.5, 0.5, 0],
  [0, 1, 0],
  [],
  [0.5, 0, 0.5, 'moccasin', 0.4, 'More than 50% sand'],
  [0.5, 0.5, 0],
  [1, 0, 0],
  [],
  [0, 0.5, 0.5, 'coral', 0.3, 'More than 50% clay'],
  [0.5, 0, 0.5],
  [0, 0, 1],
];

const loadDataToTables = () => {
  pointsTable.loadData(pointsData);
  linesTable.loadData(linesData);
  areasTable.loadData(areasData);
};

/* TODO: Code this part better */
// Check if there is something in localStorage
if (localStorage.getItem('pointsTable')) {
  const hereBeforeMessage = document.createElement('div');
  hereBeforeMessage.innerHTML = '<p>If you have found this site to be useful consider<a class="donate" role="button" href="https://paypal.me/BlomJ" rel="noopener noreferrer" target="_blank">donating</a><a class="bmc-button" rel="noopener" target="_blank" href="https://www.buymeacoffee.com/OfU1nAuiI"><img src="https://bmc-cdn.nyc3.digitaloceanspaces.com/BMC-button-images/BMC-btn-logo.svg" alt="Buying me a coffee"><span style="margin-left:5px">Buy me a coffee</span></a></p><p><strong>Do you wan\'t to load your previously entered data into the tables? </strong></p>';

  const storagePrompt = swal({
    title: 'You\'ve been here before!',
    content: hereBeforeMessage,
    buttons: {
      sample: {
        text: 'No, show sample data',
        value: null,
        visible: true,
        className: 'show-sample',
        closeModal: true,
      },
      empty: {
        text: 'No, empty the tables',
        value: 'empty',
        visible: true,
        className: 'show-empty',
        closeModal: true,
      },
      load: {
        text: 'Yes, load previous data',
        value: 'ok',
        visible: true,
        className: 'load-old',
        closeModal: true,
      },
    },
  });
  // Ask wether to load localStorage data or to load sample data
  storagePrompt.then((result) => {
    if (result === 'ok') {
      pointsData = JSON.parse(localStorage.getItem('pointsTable'));
      linesData = JSON.parse(localStorage.getItem('linesTable'));
      areasData = JSON.parse(localStorage.getItem('areasTable'));
    } else if (result === 'empty') {
      pointsData = [pointsPlaceholder];
      linesData = [linesPlaceholder];
      areasData = [areasPlaceholder];
    }
    loadDataToTables();
  });
} else {
  // First time here so load sample data
  loadDataToTables();
}

const timeOutTime = 600;

Draw.setListeners();

/* function (id) => (action) =>
document.getElementById(id)
*/

const clearPointsButton = document.getElementById('clearPoints');
clearPointsButton.addEventListener('click', () => clear('.point'));
clearPointsButton.addEventListener('mouseover', () => {
  d3.selectAll('.point')
    .attr('opacity', '0.4');

  setTimeout(() => {
    d3.selectAll('.point')
      .attr('opacity', '1');
  }, timeOutTime);
});

const clearLinesButton = document.getElementById('clearLines');
clearLinesButton.addEventListener('click', () => clear('.ternary-line'));
clearLinesButton.addEventListener('mouseover', () => {
  d3.selectAll('.ternary-line')
    .attr('stroke-opacity', '0.3');

  setTimeout(() => {
    d3.selectAll('.ternary-line')
      .attr('stroke-opacity', '1');
  }, timeOutTime);
});

const clearAreasButton = document.getElementById('clearAreas');
clearAreasButton.addEventListener('click', () => clear('.ternary-area'));
clearAreasButton.addEventListener('mouseover', () => {
  d3.selectAll('.ternary-area')
    .attr('opacity', '0.1');

  setTimeout(() => {
    d3.selectAll('.ternary-area')
      .attr('opacity', '1');
  }, timeOutTime);
});

const clearLabelsButton = document.getElementById('clearLabels');
clearLabelsButton.addEventListener('click', clearLabels);
// Show linethrough vertex labels for short while when hovering over clear Labels button
clearLabelsButton.addEventListener('mouseover', () => {
  d3.selectAll('.vertex-label')
    .attr('text-decoration', 'line-through');

  setTimeout(() => {
    d3.selectAll('.vertex-label')
      .attr('text-decoration', 'none');
  }, timeOutTime);
});

const clearAllButton = document.getElementById('clearAll');
clearAllButton.addEventListener('click', clearAll);
clearAllButton.addEventListener('mouseover', () => {
  d3.selectAll('.ternary-line,.vertex-label,.ternary-area,.point')
    .attr('opacity', '0.3')
    .attr('text-decoration', 'line-through')
    .attr('stroke-opacity', '0.3');

  setTimeout(() => {
    d3.selectAll('.ternary-line,.vertex-label,.ternary-area,.point')
      .attr('opacity', '1')
      .attr('text-decoration', 'none')
      .attr('stroke-opacity', '1');
  }, timeOutTime);
});

function warnEmptyTable(tables, tableString) {
  const removeCheck = swal(`This will remove all values you have entered into ${tableString}`, 'There\'s no going back once you click OK!',
    {
      buttons: ['Cancel', 'OK, remove values'],
      icon: 'warning',
    });

  removeCheck.then((result) => {
    if (result) {
      tables.forEach((table) => {
        let dataToLoad;
        switch (table) {
          case pointsTable:
            dataToLoad = pointsPlaceholder;
            break;
          case linesTable:
            dataToLoad = linesPlaceholder;
            break;
          case areasTable:
            dataToLoad = areasPlaceholder;
            break;
          default:
            dataToLoad = [];
        }
        table.loadData([dataToLoad]);
      });
    }
  });
}

const clearAllTablesButton = document.getElementById('clearAllTables');
clearAllTablesButton.addEventListener('click', () => {
  warnEmptyTable([pointsTable, linesTable, areasTable], 'all tables.');
});

const clearPointsTablesButton = document.getElementById('clearPointsTable');
clearPointsTablesButton.addEventListener('click', () => {
  warnEmptyTable([pointsTable], 'the points table.');
});

const clearLinesTablesButton = document.getElementById('clearLinesTable');
clearLinesTablesButton.addEventListener('click', () => {
  warnEmptyTable([linesTable], 'the lines table.');
});

const clearAreasTablesButton = document.getElementById('clearAreasTable');
clearAreasTablesButton.addEventListener('click', () => {
  warnEmptyTable([areasTable], 'the areas table.');
});

// onclick="this.parentNode.style = 'visibility: hidden; opacity: 0;transition: visibility 0s linear 0.15s, opacity 0.15s linear;'; "

/* TODO: ADD VALIDATOR THAT CHECKS IF VALUES SUM TO 100 or 1.0 and between 0 to 1.0 for opacity */
// Handsontable.validators.registerValidator('check100', check100);

// (function(Handsontable) {
//   function check100(values, callback) {
//     // ...your custom logic of the validator
//     if (va) {
//       callback(true);
//     } else {
//       callback(false);
//     }
//   }

//   // Register an alias
//   Handsontable.validators.registerValidator('my.custom', customValidator);

// }(Handsontable));
