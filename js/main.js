/* To do

--------BUGS--------
0. Export patterns
1. Fix when only one line/area is present followed by a '---'
2. https://spin.atomicobject.com/2014/01/21/convert-svg-to-png/
3. Catch errors
4. Filter out emplty arrays split dashes

2. On resize mobile
1. Column order agnostic
    Check column index between lines and point [global variable?]
    Look for words in columns that are not keywords and make those the vertexlabels

    keyword1Index: 3
    keyword2Index: 1
    keyword3Index: 2
3. Update to d3 v5
5. Upload and submit csv

- cookie: First visit example data, afterwards keep entered text or LocalStorage?
--------MAKE IT SLICKER--------
- validate input
- more error handling
- option for radius/size of point
- lines
    - end style: arrow-end) https://vanseodesign.com/web-design/svg-markers/
    - curve
- structure code better https://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
    http://jstherightway.org/#js-code-style
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects
  https://ejb.github.io/2017/08/09/a-better-way-to-structure-d3-code-es6-version.html

--------Later Features--------
- hexbin option
- areas
- heatmap & contour option
*/

let defaultPointColor = "black";
let defaultShape = "circle";

let defaultLinestyle = "none";
let defaultLineColor = "black";
let defaultStrokewidth = "4px";

let defaultAreaColor = "grey";
let defaultAreaOpacity = 0.5;

// const items = JSON.parse(localStorage.getItem("points")) || [];
labelsAdded = false;

let columns;

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

/* ------ Points ------ */
function drawPoints(d) {
  const values = d.slice([0, 3]);
  const symbol = d3.svg.symbol();
  let myValues;

  const points = ternary.plot()
    .selectAll(".point")
    .data(values);

  points.enter().append("path")
      .attr("class", "point")
      .attr("fill",function(point) { return point.color ? (point.color).trim() : (point.colour ? (point.colour).trim() : defaultPointColor)}) // both color and colour are valid
      .attr("fill-opacity", function(point) { return point.opacity ?  point.opacity.trim() : 1 }) 
      .attr("d", symbol.type(function(point) { return point.shape ? (point.shape).trim() : defaultShape; }))
      .attr("transform", function(point) {
        const myKeys = Object.keys(point);
        myValues = [point[myKeys[0]], point[myKeys[2]], point[myKeys[1]]];

        const plotCoords = ternary.point(myValues);
        return "translate(" + plotCoords[0] + "," + plotCoords[1] + ")";
      })
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)
    .append("title")
      .text( function(point) { 
        const myKeys = Object.keys(point);
        const valuesString = `${capitalize(myKeys[0])}: ${point[myKeys[0]]}, ${capitalize(myKeys[2])}: ${point[myKeys[2]]}, ${capitalize(myKeys[1])}: ${point[myKeys[1]]}`;
        return point.title ? `${capitalize(point.title.trim())}; ${valuesString}` : valuesString;
      });
}

/* ------ Lines ------ */
function drawLines(d) {
  // console.log("----------------------------------------------");
  // console.log("DRAWING", d);
  // console.log("----------------------------------------------");

  const paths = ternary.plot()
    .selectAll(".line")
    .data(d);

  // 🤔I think there must be a way to do this 'better' with Object methods
  paths.enter().append("path")
      .attr("class", "ternary-line" )
      .attr("d", function(line) {
        // Use d3.pairs?
        let drawArray = [];
        const myKeys = Object.keys(line[0]);
        // Loop over each point in line and add to drawarray because d3 path wants it that way
        for (let i = 0; i <= (line.length - 1); i+=1) {
          // d3.ternary wants the values swapped ¯\_(ツ)_/¯
          const current = [+line[i][myKeys[0]], +line[i][myKeys[2]], +line[i][myKeys[1]]]; // Better find the index of the columns that aren"t keywords
          drawArray.push(current);
        };
        return ternary.path(drawArray);
      })
      .attr("stroke-dasharray", function(line) { return line[0].linestyle ?  line[0].linestyle.trim().replace("/([\s])+/", ",") : defaultLinestyle })
      .attr("stroke", function(line) { return line[0].color ? (line[0].color).trim() : (line[0].colour ? (line[0].colour).trim() : defaultLineColor)}) // both color and colour are valid   
      .attr("stroke-opacity", function(line) { return line[0].opacity ?  line[0].opacity.trim() : 1 })
      .attr("fill-opacity", "0") // So no inside fill shows up inside lines in Adobe Illustrator 
      .attr("stroke-width", function(line) { return line[0].strokewidth ? line[0].strokewidth : defaultStrokewidth })
      .append("title") // 🤔 Would there be a way to not append a title if there is none?
        .text( function(line) { return line[0].title ? capitalize((line[0].title).trim()) : undefined; }); //Object.values(e).slice(0,3).join(", ")
}

/* ------ Areas ------ */
function drawAreas(d) {
  const paths = ternary.plot()
    .selectAll(".area")
    .data(d);

  paths.enter().append("path")
      .attr("class", "ternary-area" )
      .attr("d", function(line) {
        let drawArray = [];
        const myKeys = Object.keys(line[0]);
        for (let i = 0; i <= (line.length - 1); i+=1) {
          const current = [+line[i][myKeys[0]], +line[i][myKeys[2]], +line[i][myKeys[1]]];
          drawArray.push(current);
        };
        return ternary.area(drawArray);
      })
      .attr("fill", function(area) { return area[0].color ? (area[0].color).trim() : defaultAreaColor })
      .attr("fill-opacity", function(area) { return area[0].opacity ?  area[0].opacity.trim() : defaultAreaOpacity })
      .append("title")
        .text( function(area) { return area[0].title ? capitalize((area[0].title).trim()) : undefined; });
}

function submittedPoints(e) {
  e.preventDefault();
  const parsedInput = d3.csvParse((this.querySelector("[name=item]")).value.toLowerCase());

  parsedInput.columns = parsedInput.columns.map(col => col.trim());

  if (!columns) {
    columns = parsedInput.columns.slice(0,3).map(col => col.trim());
  } else {
    if (JSON.stringify(parsedInput.columns.slice(0,3)) !== JSON.stringify(columns)) swal("Your columns in Points and Lines don't seem to match", `Your columns for points are "${parsedInput.columns.slice(0,3)}" and for lines they are "${columns}". . The point will still be plotted, but they might appear the way you intended.`, "warning");
  }

  columns.some(v => { if (reserved.includes(v)) { swal("Reserved column name", `You can't use any of the following names as your columns names: ${reserved.join(', ')}`, "error") }; return }) 

  if (!labelsAdded) { addVertexLabels(parsedInput); labelsAdded = true;}
  drawPoints(parsedInput);
}

function parse(data) {
  let splitNewlines = data.split(/([-])+/).map(d => d.split("\n")); // Split by dashes [separate lines to draw], then split by newlines [separate points in each line]
  
  const columnsString = splitNewlines[0].shift(); // Remove first entry (Columns)
  const columnsArray = columnsString.split(",").map(col => col.trim()); // Array with column names

  // Check if lines column names match with point column names
  if (!columns) {
    columns = columnsArray.slice(0,3)
  } else {
    if (JSON.stringify(columnsArray.slice(0,3)) !== JSON.stringify(columns)) {
      swal("Your columns in Points, Lines and areas don't seem to match", `Your columns you entered first are "${columns}" and for your columns now are "${columnsArray.slice(0,3)}". Your data will still be plotted, but it might not appear the way you intended.`, "warning");
    }
  }

  columns.some(v => { if (reserved.includes(v)) { swal("Reserved column name", `You can't use any of the following names as your columns names: ${reserved.join(', ')}`, "error") }; return }) 

  splitNewlines = splitNewlines.map(arr => arr.filter(entry => String(entry) !== "")); // Filter out empty entries
  // splitNewlines = splitNewlines.map(arr => arr.filter(entry => entry !== /([-])+/)); // Filter out dashed

  const lines = splitNewlines.map(point => point.map(value => value.split(",")) );

  if (!labelsAdded) { addVertexLabels({columns: columnsArray}); labelsAdded = true;}

  // Its ugly but it works ¯\_(ツ)_/¯
  const objectsArray = lines.map(line => {
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

function submittedLines(e) {
  e.preventDefault();

  const rawInput = (this.querySelector("[name=item]")).value;
  const lineObjectsArray = parse(rawInput);

  drawLines(lineObjectsArray);
}

function submittedAreas(e) {
  e.preventDefault();

  const rawInput = (this.querySelector("[name=item]")).value;

  const areaObjectsArray = parse(rawInput);

  drawAreas(areaObjectsArray);
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
  const labels = cols.map(d => capitalize(d));
  ternary.call(d3.ternary.vertexLabels(labels))
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

/* event listeners */
document.enterPoints.addEventListener("submit", submittedPoints);
document.enterLines.addEventListener("submit", submittedLines);
document.enterAreas.addEventListener("submit", submittedAreas);

const clearPointsButton = document.getElementById("clearPoints");
clearPointsButton.addEventListener("click", clearPoints);
clearPointsButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".point")
    .attr("opacity", "0.4");

  setTimeout(function() {
    d3.selectAll(".point")
      .attr("opacity", "1");
  }, 600);  
});

const clearLinesButton = document.getElementById("clearLines");
clearLinesButton.addEventListener("click", clearLines);
clearLinesButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-area")
    .attr("stroke-opacity", "0.3");

  setTimeout(function() {
    d3.selectAll(".ternary-area")
      .attr("stroke-opacity", "1");
  }, 600);  
});

const clearAreasButton = document.getElementById("clearAreas");

clearAreasButton.addEventListener("click", clearAreas );
clearAreasButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-area")
    .attr("fill-opacity", "0.1");

  setTimeout(function() {
    d3.selectAll(".ternary-area")
      .attr("fill-opacity", "1");
  }, 600);  
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
  }, 700);
})

const clearAllButton = document.getElementById("clearAll");
clearAllButton.addEventListener("click", clearAll);

document.querySelector(`select[name="defaultColorPoints"]`).onchange = function() { defaultPointColor = event.target.value; };
document.querySelector(`select[name="defaultShape"]`).onchange = function() { defaultShape = event.target.value; };

document.querySelector(`select[name="defaultColorLines"]`).onchange = function() { defaultLineColor = event.target.value; };
document.querySelector(`select[name="defaultLineStyle"]`).onchange = function() { defaultLinestyle = event.target.value; };

document.querySelector(`select[name="defaultColorAreas"]`).onchange = function() { defaultAreaColor = event.target.value; }
document.querySelector(`select[name="defaultAreaOpacity"]`).onchange = function() { defaultAreaPattern = event.target.value; }

window.addEventListener("resize",  resize(ternary))
