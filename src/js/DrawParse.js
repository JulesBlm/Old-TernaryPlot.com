/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import d3 from 'd3';
import swal from 'sweetalert';
import './ternary.v3';
import {
 resize, capitalize, removeTrailingElements, getDrawArray,
} from './helpers';

const graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

const initialPlotSize = (window.innerWidth > 500) ? [500, 500] : [window.innerWidth, window.innerWidth];

// console.log({initialPlotSize})

const ternary = d3.ternary.plot()
  .call(resize, initialPlotSize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

/* TODO: Not use these as globals */
let labelsAdded = false;
let columns;

const reserved = ['colour', 'color', 'shape', 'linestyle', 'title', 'opacity'];

function addVertexLabels(f) {
  const cols = (f.columns).slice(0, 3);
  ternary.call(d3.ternary.vertexLabels(cols));
}

function clearLabels() {
  d3.selectAll('.vertex-label').remove();
  labelsAdded = false;
  columns = undefined;
}

// Check if lines column names match with previous column names
function checkColumns(columnNames) {
  if (!columns) {
    columns = columnNames.slice(0, 3);

    // Add labels to ternary plot
    if (!labelsAdded) { addVertexLabels({ columns: columnNames }); labelsAdded = true; }
  } else if (JSON.stringify(columnNames.slice(0, 3)) !== JSON.stringify(columns)) {
    const labelsMessage = document.createElement('div');
    labelsMessage.innerHTML = `The current labels are '${columns}' and you're now trying to plot data with columns '${columnNames.slice(0, 3)}'. Your data will still be plotted, but it might not appear the way you intended. <br> Try clicking the <input type="button" id="specialClearLabels" aria-label="Remove Labels" value="Remove Labels"> button and plotting again.`;
    swal({
      title: 'Your columns names entered in the Points, Lines and Areas tables don\'t seem to match',
      content: labelsMessage,
      icon: 'warning',
    });

    const specialClearLabel = document.getElementById('specialClearLabels');
    specialClearLabel.addEventListener('click', clearLabels);
  }
  // Check for reserved keywords in column names
  columns.some((key) => {
    if (reserved.includes(key.toLowerCase())) {
      return swal('Reserved column name', `You can't use any of the following names as your columns names: ${reserved.join(', ')}`, 'error');
    }
  });
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

const Parse = {

  Points(data) {
    let rows = data;
    let columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map(line => removeTrailingElements(line));

    // Remove trailing empty strings and nulls from columns array
    columnsArray = removeTrailingElements(columnsArray);

    while (columnsArray[columnsArray.length - 1] === null || columnsArray[columnsArray.length - 1] === '') { // While the last element is a null or empty string
      columnsArray.pop(); // Remove that last element
    }

    // Filter all empty line arrays
    rows = rows.filter(arr => arr.length !== 0);

    // Construct array of object with properties for drawing
    // Its ugly but it works ¯\_(ツ)_/¯
    const objectsArray = rows.map((line) => {
      const point = columnsArray.reduce((result, column, i) => {
        const pointValue = result;
        pointValue[column.toString().toLowerCase()] = line[i];
        return pointValue;
      }, {});
      return point;
    });

    return objectsArray;
  },

  LinesAreas(data) {
    const rows = data;
    let columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map(line => removeTrailingElements(line));

    // Remove trailing empty strings and nulls from columns array
    columnsArray = removeTrailingElements(columnsArray);

    const linesToDraw = [];
    let drawLine = [];

    // Loop over rows array
    // rows.forEach(point => {})
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

  // Set listeners for selection of default draw properties
  setListeners() {
    document.querySelector('#defaultColorPoints').onchange = ({ target }) => { Draw.defaults.pointColor = target.value; };
    document.querySelector('select[name=\'defaultShape\']').onchange = ({ target }) => { Draw.defaults.pointShape = target.value; };
    document.querySelector('#defaultPointsize').onchange = ({ target }) => { Draw.defaults.pointSize = target.value; };

    document.querySelector('#defaultColorLines').onchange = ({ target }) => { Draw.defaults.lineColor = target.value; };
    document.querySelector('select[name=\'defaultLineStyle\']').onchange = ({ target }) => { Draw.defaults.lineStyle = target.value; };
    document.querySelector('#defaultLinewidth').onchange = ({ target }) => { Draw.defaults.lineStrokewidth = target.value; };

    document.querySelector('#defaultColorAreas').onchange = ({ target }) => { Draw.defaults.areaColor = target.value; };
    document.querySelector('select[name=\'defaultAreaOpacity\']').onchange = ({ target }) => { Draw.defaults.areaOpacity = target.value; };
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
        .type(point => (point.shape ? (point.shape).trim() : Draw.defaults.pointShape)) // use this?
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
          const entries = Object.entries(point);
          if (entries) {
            const valuesString = `${entries[0].join(': ')}\n${entries[1].join(': ')}\n${entries[2].join(': ')}`;
            return point.title ? `${capitalize(point.title.trim())} \n ${valuesString}` : valuesString;
          }
        });
  },

  Lines(d) {
    const paths = ternary.plot()
      .selectAll('.line')
      .data(d);

    const strokedashDict = {
      'dotted': '3 2',
      'dot-dash': '10 3 4 3',
      'dot-dot-dash': '10 3 4 3 4 3',
      'short-dashed': 4,
      'medium-dashed': 17,
      'long-dashed': 26,
    };

    // 🤔I think there must be a way to do this 'better' with Object methods
    paths.enter().append('path')
      .attr('class', 'ternary-line')
      .attr('d', (line) => {
        const drawArray = getDrawArray(line);
        return ternary.path(drawArray);
      })
      .attr('stroke-dasharray', line => (line[0].linestyle ? strokedashDict[line[0].linestyle] : Draw.defaults.lineStyle)) // (line[0].linestyle).trim()
      .attr('stroke', line => (line[0].color ? (line[0].color).trim() : (line[0].colour ? (line[0].colour).trim() : Draw.defaults.lineColor))) // both color and colour are valid
      .attr('stroke-opacity', line => (line[0].opacity ? (line[0].opacity).trim() : 1))
      .attr('fill-opacity', '0') // So no inside fill shows up inside lines in Adobe Illustrator
      .attr('stroke-width', line => (line[0].strokewidth ? line[0].strokewidth : Draw.defaults.lineStrokewidth))
      .append('title') // 🤔 Would there be a way to not append a title if there is none?
        .text(line => (line[0].title ? capitalize(((line[0].title)).toString().trim()) : '')); // Object.values(e).slice(0,3).join(', ')
  },

  // Takes in data entered in the Areas Table and draws them onto the Ternary Plot
  Areas(d) {
    const paths = ternary.plot()
      .selectAll('.area')
      .data(d);

    paths.enter().append('path')
      .attr('class', 'ternary-area')
      .attr('d', (line) => {
        const drawArray = getDrawArray(line);
        return ternary.area(drawArray);
      })
      .attr('z-index', -1)
      .attr('fill', area => (area[0].color ? (area[0].color).trim() : Draw.defaults.areaColor))
      .attr('fill-opacity', area => (area[0].opacity ? area[0].opacity : 0.5))
      .append('title')
      .text(area => (area[0].title ? capitalize((area[0].title).trim()) : undefined));
  },

};

d3.select('#ternary-plot').call(ternary);
window.addEventListener('resize', resize(ternary));

export { Parse, Draw, clearLabels };
