/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-sparse-arrays */
// when updated to d3 v5 only import d3.svg, d3.select, d3.scale, d3.dispatch, d3.sum is all we need
import d3 from 'd3';
import Handsontable from 'handsontable';
import swal from 'sweetalert';
import './ternary.v3';

// If localstorage dont show message
// if (document.cookie.split(';').filter((item) => item.includes('visited=true')).length) {
//   document.querySelector('#id').remove();
// } else {
//   document.cookie = 'visited=true';
// }

let labelsAdded = false;
let columns;
const reserved = ['colour', 'color', 'shape', 'linestyle', 'title', 'opacity'];

function resize(t) {
  if (window.innerWidth > 600) {
    t.fit(500, 500);
  } else {
    t.fit(window.innerWidth, window.innerHeight);
  }
}

const graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

const ternary = d3.ternary.plot()
  .call(resize, [500, 500])
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

function capitalize(word) {
  return word.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

function showHelpLines(e) {
  let pointValues = Object.values(e);
  pointValues = [pointValues[0], pointValues[2], pointValues[1]];

  // Its ugly but it works is my motto for programming
  const helpLinesArray = [
    [pointValues,
      [
        0,
        parseFloat(pointValues[0]) + parseFloat(pointValues[1]),
        parseFloat(pointValues[2])],
    ],
    [pointValues,
      [
        parseFloat(pointValues[0]),
        0,
        parseFloat(pointValues[1]) + parseFloat(pointValues[2]),
      ],
    ],
    [pointValues,
      [
        parseFloat(pointValues[0]) + parseFloat(pointValues[2]),
        parseFloat(pointValues[1]),
        0,
      ],
    ],
  ];

  const helpLines = ternary.plot()
    .selectAll('.line')
    .data(helpLinesArray);

  // I could (should?) use the linesToDraw function but that one is geared towards the submmittedLines format and this is easier🤗
  helpLines.enter().append('path')
    .attr('class', 'help-line')
    .attr('d', line => ternary.path(line))
    .attr('stroke-dasharray', '3, 3, 3')
    .attr('stroke', 'black')
    .attr('stroke-width', '1px')
    .attr('z-index', '-1');
}

function addVertexLabels(f) {
  const cols = (f.columns).slice(0, 3);
  ternary.call(d3.ternary.vertexLabels(cols));
}

// Check if lines column names match with previous column names
function checkColumns(columnNames) {
  if (!columns) {
    columns = columnNames.slice(0, 3);

    // Add labels to ternary plot
    if (!labelsAdded) { addVertexLabels({ columns: columnNames }); labelsAdded = true; }
  } else if (JSON.stringify(columnNames.slice(0, 3)) !== JSON.stringify(columns)) {
    swal('Your columns in Points, Lines and areas don\'t seem to match', `Your columns you entered first are '${columns}' and for your columns now are '${columnNames.slice(0, 3)}'. Your data will still be plotted, but it might not appear the way you intended.`, 'warning');
  }
  // Check for reserved keywords in column names
  columnNames.some((key) => {
    if (reserved.includes(key)) {
      return swal('Reserved column name', `You can't use any of the following names as your columns names: ${reserved.join(', ')}`, 'error');
    }
  });
}

const parse = {

  Points(data) {
    let rows = data;
    const columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map((line) => {
      while (line[line.length - 1] === null || line[line.length - 1] === '') { // While the last element is a null or empty string
        line.pop(); // Remove that last element
      }
      return line;
    });

    // Filter all empty line arrays
    rows = rows.filter(arr => arr.length !== 0);

    // Construct array of object with properties for drawing
    // Its ugly but it works ¯\_(ツ)_/¯
    const objectsArray = rows.map((line) => {
      const point = columnsArray.reduce((result, column, i) => {
        const pointValue = result;
        pointValue[column.toLowerCase()] = line[i];
        return pointValue;
      }, {});
      return point;
    });

    return objectsArray;
  },

  LinesAreas(data) {
    const rows = data;
    const columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map((line) => {
      while (line[line.length - 1] === null || line[line.length - 1] === '') { // While the last element is a null or empty string
        line.pop(); // Remove that last element
      }
      return line;
    });

    const linesToDraw = [];
    let drawLine = [];

    // Loop over rows array
    for (const point of rows) {
      if (point.length !== 0) {
        drawLine.push(point); // Add to drawLine
      } else if (point.length === 0) { // When separator is encountered (an empty row), clear drawLine array to start new one
        if (drawLine.length !== 0) { linesToDraw.push(drawLine); }
        drawLine = []; // Reset drawLine
      }
    }

    const objectsArray = linesToDraw.map((line) => {
      const lineObjects = line.map((p) => {
        const point = columnsArray.reduce((result, column, i) => {
          const linePointValue = result;
          linePointValue[column.toLowerCase()] = p[i];
          return linePointValue;
        }, {});
        return point;
      });
      return lineObjects;
    });
    return objectsArray;
  },
};

const Draw = {

  defaults: {
    pointColor: 'black',
    pointShape: 'circle',
    pointSize: 70,
    lineStyle: 'none', // solid
    lineColor: 'black',
    lineStrokewidth: '4px',
    areaColor: 'gold',
    areaOpacity: 0.2,
  },

  setListeners() {
    document.querySelector('select[name=\'defaultColorPoints\']').onchange = (event) => { Draw.defaults.pointColor = event.target.value; };
    document.querySelector('select[name=\'defaultShape\']').onchange = (event) => { Draw.defaults.pointShape = event.target.value; };

    document.querySelector('select[name=\'defaultColorLines\']').onchange = (event) => { Draw.defaults.lineColor = event.target.value; };
    document.querySelector('select[name=\'defaultLineStyle\']').onchange = (event) => { Draw.defaults.lineStyle = event.target.value; };

    document.querySelector('select[name=\'defaultColorAreas\']').onchange = (event) => { Draw.defaults.areaColor = event.target.value; };
    document.querySelector('select[name=\'defaultAreaOpacity\']').onchange = (event) => { Draw.defaults.areaOpacity = event.target.value; };
  },

  Points(d) {
    const values = d.slice([0, 3]);
    const symbol = d3.svg.symbol();

    const points = ternary.plot()
      .selectAll('.point')
      .data(values);

    points.enter().append('path')
      .attr('class', 'point')
      .attr('fill', point => (point.color ? (point.color).trim() : (point.colour ? (point.colour).trim() : Draw.defaults.pointColor))) // both color and colour are valid
      .attr('fill-opacity', point => (point.opacity ? point.opacity : 1))
      .attr('d', symbol
        .type(point => (point.shape ? (point.shape).trim() : Draw.defaults.pointShape))
        .size(point => (point.size ? point.size : Draw.defaults.pointSize)))
      .attr('transform', (point) => {
        const pointValues = Object.values(point);
        const myPointValues = [pointValues[0], pointValues[2], pointValues[1]];
        const plotCoords = ternary.point(myPointValues); // Convert to barycentric coordinates
        return `translate(${plotCoords[0]},${plotCoords[1]})`;
      })
      .on('mouseover', showHelpLines)
      .on('mouseout', () => { d3.selectAll('.help-line').remove(); })
      .append('title')
      .text((point) => {
        const myKeys = Object.keys(point);
        const valuesString = `${capitalize(myKeys[0])}: ${point[myKeys[0]]}, ${capitalize(myKeys[2])}: ${point[myKeys[2]]}, ${capitalize(myKeys[1])}: ${point[myKeys[1]]}`;
        return point.title ? `${capitalize(point.title.trim())}; ${valuesString}` : valuesString;
      });
  },

  Lines(d) {
    const paths = ternary.plot()
      .selectAll('.line')
      .data(d);

    // 🤔I think there must be a way to do this 'better' with Object methods
    paths.enter().append('path')
      .attr('class', 'ternary-line')
      .attr('d', (line) => {
        const drawArray = [];
        // Loop over each point in line and add to drawarray because d3 path wants it that way
        line.forEach((point) => {
          const pointValues = Object.values(point);
          drawArray.push([pointValues[0], pointValues[2], pointValues[1]]); // d3.ternary wants the values swapped ¯\_(ツ)_/¯
        });
        return ternary.path(drawArray);
      })
      .attr('stroke-dasharray', line => (line[0].linestyle ? (line[0].linestyle).trim() : Draw.defaults.lineStyle))
      .attr('stroke', line => (line[0].color ? (line[0].color).trim() : (line[0].colour ? (line[0].colour).trim() : Draw.defaults.lineColor))) // both color and colour are valid
      .attr('stroke-opacity', line => (line[0].opacity ? (line[0].opacity).trim() : 1))
      .attr('fill-opacity', '0') // So no inside fill shows up inside lines in Adobe Illustrator
      .attr('stroke-width', line => (line[0].strokewidth ? line[0].strokewidth : Draw.defaults.lineStrokewidth))
      .append('title') // 🤔 Would there be a way to not append a title if there is none?
      .text(line => (line[0].title ? capitalize((line[0].title).trim()) : undefined)); // Object.values(e).slice(0,3).join(', ')
  },

  // Takes in data entered in the Areas Table and draws them onto the Ternary Plot
  Areas(d) {
    const paths = ternary.plot()
      .selectAll('.area')
      .data(d);

    paths.enter().append('path')
      .attr('class', 'ternary-area')
      .attr('d', (line) => {
        const drawArray = [];
        line.forEach((point) => {
          const pointValues = Object.values(point);
          drawArray.push([pointValues[0], pointValues[2], pointValues[1]]); // d3.ternary wants the values swapped ¯\_(ツ)_/¯
        });
        return ternary.area(drawArray);
      })
      .attr('z-index', -1)
      .attr('fill', area => (area[0].color ? (area[0].color).trim() : Draw.defaults.areaColor))
      .attr('fill-opacity', area => (area[0].opacity ? area[0].opacity : 0.5))
      .append('title')
      .text(area => (area[0].title ? capitalize((area[0].title).trim()) : undefined));
  },

};

function HandsOnTableCreator(ID, sampleData, placeholder) {
  return new Handsontable(ID, {
    data: sampleData,
    colHeaders: placeholder,
    fixedRowsTop: 1,
    manualColumnMove: true,
    manualRowMove: true,
    rowHeaders: true,
    minRows: 100,
    height: 330,
    width: 500,
    dropdownMenu: true,
    manualColumnResize: true,
    persistentState: true,
    licenseKey: 'non-commercial-and-evaluation',
  });
}

// TODO: Check if there is anything in localstorage
let pointsData = [];

if (pointsData.length === 0) {
  pointsData = [
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
}

const pointsPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Shape', 'Size', 'Opacity', 'Title'];

const pointsTable = HandsOnTableCreator(document.getElementById('pointsTable'), pointsData, pointsPlaceholder);
const submitPointsButton = document.enterPoints;

Handsontable.dom.addEvent(submitPointsButton, 'submit', (e) => {
  e.preventDefault();

  const parsedPoints = parse.Points(pointsTable.getData());
  Draw.Points(parsedPoints);
});

const linesSampledata = [
  ['1. Sand', '2. Silt', '3. Clay', 'Color', 'Linestyle', 'Strokewidth', 'Title'],
  [0.2, 0.8, 0, 'orangered', '5 3 5', 2, 'dotted line 1'],
  [0.8, 0, 0.2],
  [],
  [0.1, 0.1, 0.8, 'slateblue'],
  [0.4, 0.1, 0.5],
  [0, 0, 1],
];

const linesPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Linestyle', 'Strokewidth', 'Title'];

const linesTable = HandsOnTableCreator(document.getElementById('linesTable'), linesSampledata, linesPlaceholder);
const submitLinesButton = document.enterLines;
Handsontable.dom.addEvent(submitLinesButton, 'submit', (e) => {
  e.preventDefault();

  const parsedLines = parse.LinesAreas(linesTable.getData());

  Draw.Lines(parsedLines);
});

const areasSampledata = [
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
const areasPlaceholder = ['Variable 1', 'Variable 2', 'Variable 3', 'Color', 'Opacity', 'Title'];

const areasTable = HandsOnTableCreator(document.getElementById('areasTable'), areasSampledata, areasPlaceholder);
const submitAreasButton = document.enterAreas;
Handsontable.dom.addEvent(submitAreasButton, 'submit', (e) => {
  e.preventDefault();

  const parsedAreas = parse.LinesAreas(areasTable.getData());
  Draw.Areas(parsedAreas);
});

d3.select('#ternary-plot').call(ternary);

function clearLabels() {
  d3.selectAll('.vertex-label').remove();
  labelsAdded = false;
  columns = undefined;
}

function clearPoints() {
  d3.selectAll('.point').remove();
}

function clearLines() {
  d3.selectAll('.ternary-line').remove();
}

function clearAreas() {
  d3.selectAll('.ternary-area').remove();
}

function clearAll() {
  clearLines();
  clearPoints();
  clearLabels();
  clearAreas();
}

const timeOutTime = 600;

Draw.setListeners();

const clearPointsButton = document.getElementById('clearPoints');
clearPointsButton.addEventListener('click', clearPoints);
clearPointsButton.addEventListener('mouseover', () => {
  d3.selectAll('.point')
    .attr('opacity', '0.4');

  setTimeout(() => {
    d3.selectAll('.point')
      .attr('opacity', '1');
  }, timeOutTime);
});

const clearLinesButton = document.getElementById('clearLines');
clearLinesButton.addEventListener('click', clearLines);
clearLinesButton.addEventListener('mouseover', () => {
  d3.selectAll('.ternary-line')
    .attr('stroke-opacity', '0.3');

  setTimeout(() => {
    d3.selectAll('.ternary-line')
      .attr('stroke-opacity', '1');
  }, timeOutTime);
});

const clearAreasButton = document.getElementById('clearAreas');
clearAreasButton.addEventListener('click', clearAreas); // .remove() );
clearAreasButton.addEventListener('mouseover', () => {
  d3.selectAll('.ternary-area')
    .attr('fill-opacity', '0.1');

  setTimeout(() => {
    d3.selectAll('.ternary-area')
      .attr('fill-opacity', '1');
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
    .attr('fill-opacity', '0.3')
    .attr('text-decoration', 'line-through')
    .attr('stroke-opacity', '0.3');

  setTimeout(() => {
    d3.selectAll('.ternary-line,.vertex-label,.ternary-area,.point')
      .attr('fill-opacity', '1')
      .attr('text-decoration', 'none')
      .attr('stroke-opacity', '1');
  }, timeOutTime);
});

window.addEventListener('resize', resize(ternary));
