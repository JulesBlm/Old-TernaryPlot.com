/* To do

ADD rows!
0. Ignore empty rows for points and split for points/areas
1. columns widths table
2. localStorage
3. Make function to construct HOTtable for each type MODULARIZE
4. Default value renderer
5. https://docs.handsontable.com/4.0.0/demo-data-validation.html

Explanation in firefox doesnt work

https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
On resize mobile
Update to d3 v5
Upload and submit csv
- option for radius/size of point
- lines
    - end style: arrow-end) https://vanseodesign.com/web-design/svg-markers/
    - curve
- structure code better https://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
    http://jstherightway.org/#js-code-style
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects
  https://ejb.github.io/2017/08/09/a-better-way-to-structure-d3-code-es6-version.html
*/


// ??? Big ass 'case' functon because there are only three typse anyway ???
// ??? height and width as function of pagesize ???
function HandsOnTableCreator(ID, sampleData) {
  return new Handsontable(ID, {
    data: sampleData,
    fixedRowsTop: 1,
    manualColumnMove: true,
    manualRowMove: true,  
    rowHeaders: true,
    colHeaders: true,
    minRows: 100,
    height: 300,
    width: 500,
    dropdownMenu: true,
    manualColumnResize: true
  });  
}

labelsAdded = false;
let columns;

var pointsSampledata = [
  ["Sand", "Silt", "Clay", "Color", "Shape", "Title"],
  [0.3, 0.3, 0.4, "limegreen", "", "Sample Nr 1"],
  [1,0,0],
  [0,1,0],
  [0,0,1],
  [0.2,0.5,0.3,"coral"],
  [0.3, 0.1, 0.6,"magenta","cross"],
  [0.5,0.5,0,"#d1b621","diamond"],
  [0.6,0.2,0.2,"peru","triangle-up"]
];

const pointsTable = HandsOnTableCreator(document.getElementById("pointsTable"), pointsSampledata);

const submitPointsButton = document.enterPoints;

Handsontable.dom.addEvent(submitPointsButton, "submit", function(e) {
  e.preventDefault();

  let pointsData = pointsTable.getData();
  const parsedPoints = parsePoints(pointsData);
  drawPoints(parsedPoints);
});

var linesSampledata = [
  ["Sand", "Silt", "Clay", "Color", "Linestyle", "Strokewidth", "Title"],
  [0.2,0.8,0,"orangered","5 3 5",2,"dotted line 1"],
  [0.8,0,0.2,],
  [],
  [0.1,0.1,0.8,"slateblue"],
  [0.4,0.1,0.5],
  [0,0,1]
];

const linesTable = HandsOnTableCreator(document.getElementById("linesTable"), linesSampledata);
const submitLinesButton = document.enterLines;
Handsontable.dom.addEvent(submitLinesButton, "submit", function(e) {
  e.preventDefault();

  const linesData = linesTable.getData();
  const parsedLines = parseLinesAreas(linesData);

  drawLines(parsedLines);
});

const areasSampledata = [
  ["Sand","Silt","Clay","Color","Opacity","Title"],
  [0,0.5,0.5,"palegreen",0.1,"More than 50% silt"],
  [0.5,0.5,0],
  [0,1,0],
  [],
  [0.5,0,0.5,"moccasin",0.4,"More than 50% sand"],
  [0.5,0.5,0],
  [1,0,0],
  [],
  [0,0.5,0.5,"coral",0.3,"More than 50% clay"],
  [0.5,0,0.5],
  [0,0,1]
];

var areasTable = HandsOnTableCreator(document.getElementById("areasTable"), areasSampledata);
const submitAreasButton = document.enterAreas;
Handsontable.dom.addEvent(submitAreasButton, "submit", function(e) {
  e.preventDefault();

  let areasData = areasTable.getData();
  const parsedAreas = parseLinesAreas(areasData);
  drawAreas(parsedAreas);
});

function capitalize(word) {
  return word.toLowerCase().replace(/\b[a-z]/g, function(letter) {
       return letter.toUpperCase();
  });
}

const reserved = ["colour", "color", "shape", "linestyle", "title"];

const graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

function resize(t) {
  if ( window.innerWidth > 600) { t.fit(500, 500); }
  else { t.fit(window.innerWidth, window.innerHeight); }
};

const ternary = d3.ternary.plot()
  .call(resize, [500, 500])
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);


d3.select("#ternary-plot").call(ternary);

// ??? One parse function for all types ???
// ??? break up into smaller functions

// Check if lines column names match with previous column names
function checkColumns(columnNames) {
  if (!columns) {
    columns = columnNames.slice(0,3);

    // Add labels to ternary plot
    if (!labelsAdded) { addVertexLabels({columns: columnNames}); labelsAdded = true;}
  } else {
    if (JSON.stringify(columnNames.slice(0,3)) !== JSON.stringify(columns)) {
      swal("Your columns in Points, Lines and areas don't seem to match", `Your columns you entered first are "${columns}" and for your columns now are "${columnNames.slice(0,3)}". Your data will still be plotted, but it might not appear the way you intended.`, "warning");
    }
  };

  // Check for reserved keywords in column names
  columnNames.some(key => { if (reserved.includes(key)) {
        swal("Reserved column name", `You can't use any of the following names as your columns names: ${reserved.join(", ")}`, "error") };
        return;
  })
}

function parsePoints(data) {
  let lines = data;
  const columnsArray = lines.shift(); // Construct an array with column names

  checkColumns(columnsArray);

  // Filter out empty/null entries
  lines = lines.map(arr => arr.filter(entry => entry !== null));
  lines = lines.filter(arr => arr.length !== 0);

  // Construct array of object with properties for drawing
  // Its ugly but it works ¯\_(ツ)_/¯
  const objectsArray = lines.map(line => {
      const point = columnsArray.reduce(function(result, column, i) {
        result[column.toLowerCase()] = line[i];
        return result;
      }, {});
      return point
    });

  return objectsArray
}

function parseLinesAreas(data) {
  let lines = data;
  const columnsArray = lines.shift();

  checkColumns(columnsArray);

  // Add labels to ternary plot

  lines = lines.map(arr => arr.filter(entry => entry !== null)); // Filter out empty/null entries
  const drawLines = [];

  let drawLine = [];
  // Loop over lines array
  for (i = 0; i < lines.length; i++) {
    // Check if entry is not empty
    if (lines[i].length !== 0) {
      // Add to drawLine
      drawLine.push(lines[i]);
    } else if (lines[i].length === 0) {
      if (drawLine.length !== 0) { drawLines.push(drawLine); }
      drawLine = []
    }
  }

  const objectsArray = drawLines.map(line => {
    const lineObjects = line.map(function(p) {
      const point = columnsArray.reduce(function(result, column, i) {
        result[column.toLowerCase()] = p[i];
        return result;
      }, {});
      return point
    });
    return lineObjects
  });

  return objectsArray
}

function handleMouseOver(e) { 
  const entries = Object.entries(e).slice(0,3);

  let pointValues = Object.values(e);
  pointValues = [pointValues[0], pointValues[2], pointValues[1]];

  // Its ugly but it works is my motto for programming
  const helpLinesArray = [
    [pointValues, 
      [
        0,
        parseFloat(pointValues[0]) + parseFloat(pointValues[1]),
        parseFloat(pointValues[2]) ]
      ],  
    [pointValues,
      [
        parseFloat(pointValues[0]),
        0,
        parseFloat(pointValues[1]) + parseFloat(pointValues[2])
      ]
    ],
    [pointValues, 
      [
        parseFloat(pointValues[0]) + parseFloat(pointValues[2]),      
        parseFloat(pointValues[1]),
        0        
      ]
    ]
  ]

  const helpLines = ternary.plot()
    .selectAll(".line")
    .data(helpLinesArray);

  // I could (should?) use the drawLines function but that one is geared towards the submmittedLines format and this is easier🤗
  helpLines.enter().append("path")
      .attr("class", "help-line")
      .attr("d", function(line) { return ternary.path(line) })
      .attr("stroke-dasharray", "3, 3, 3")
      .attr("stroke", "black")  
      .attr("stroke-width", "1px")
      .attr("z-index", "-1");
}

function handleMouseOut(e) {
  d3.selectAll(".help-line").remove()
}

function addVertexLabels(f) {
  const cols = (f.columns).slice(0, 3);
  ternary.call(d3.ternary.vertexLabels(cols))
}

function clearLabels() {
  d3.selectAll(".vertex-label").remove();
  labelsAdded = false;
  columns = undefined;  
}

function clearPoints(e) {
  d3.selectAll(".point").remove();
}

function clearLines(e) {
  d3.selectAll(".ternary-line").remove();
}

function clearAreas(e) {
  d3.selectAll(".ternary-area").remove();
}

function clearAll(e) {
  clearLines();
  clearPoints();
  clearLabels();
  clearAreas();
}

const timeOutTime = 600;

const clearPointsButton = document.getElementById("clearPoints");
clearPointsButton.addEventListener("click", clearPoints);
clearPointsButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".point")
    .attr("opacity", "0.4");

  setTimeout(function() {
    d3.selectAll(".point")
      .attr("opacity", "1");
  }, timeOutTime);  
});

const clearLinesButton = document.getElementById("clearLines");
clearLinesButton.addEventListener("click", clearLines);
clearLinesButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-line")
    .attr("stroke-opacity", "0.3");

  setTimeout(function() {
    d3.selectAll(".ternary-line")
      .attr("stroke-opacity", "1");
  }, timeOutTime);  
});

const clearAreasButton = document.getElementById("clearAreas");

clearAreasButton.addEventListener("click", clearAreas );
clearAreasButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-area")
    .attr("fill-opacity", "0.1");

  setTimeout(function() {
    d3.selectAll(".ternary-area")
      .attr("fill-opacity", "1");
  }, timeOutTime);  
});

const clearLabelsButton = document.getElementById("clearLabels");
clearLabelsButton.addEventListener("click", clearLabels);
// Show linethrough vertex labels for short while when hovering over clear Labels button
clearLabelsButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".vertex-label")
    .attr("text-decoration", "line-through");

  setTimeout(function() {
    d3.selectAll(".vertex-label")
      .attr("text-decoration", "none");
  }, timeOutTime);
})

const clearAllButton = document.getElementById("clearAll");
clearAllButton.addEventListener("click", clearAll);
clearAllButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-line,.vertex-label,.ternary-area,.point")
    .attr("fill-opacity", "0.3")
    .attr("text-decoration", "line-through")
    .attr("stroke-opacity", "0.3");

  setTimeout(function() {
    d3.selectAll(".ternary-line,.vertex-label,.ternary-area,.point")
        .attr("fill-opacity", "1")
        .attr("text-decoration", "none")
        .attr("stroke-opacity", "1");
  }, timeOutTime);
})

/* Set default parameters */
document.querySelector(`select[name="defaultColorPoints"]`).onchange = function() { defaultPointColor = event.target.value; };
document.querySelector(`select[name="defaultShape"]`).onchange = function() { defaultShape = event.target.value; };

document.querySelector(`select[name="defaultColorLines"]`).onchange = function() { defaultLineColor = event.target.value; };
document.querySelector(`select[name="defaultLineStyle"]`).onchange = function() { defaultLinestyle = event.target.value; };

document.querySelector(`select[name="defaultColorAreas"]`).onchange = function() { defaultAreaColor = event.target.value; }
document.querySelector(`select[name="defaultAreaOpacity"]`).onchange = function() { defaultAreaPattern = event.target.value; }

window.addEventListener("resize",  resize(ternary))
