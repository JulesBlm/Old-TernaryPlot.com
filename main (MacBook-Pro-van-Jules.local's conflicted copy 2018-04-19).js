/* To do

--------BUGS--------
? Lines always close
2. Sweet alert
3. Catch errores

Nav current underlined

0. Make animated explanation
1. Fix reveal with d3.
1. Column order agnostic
    Check column index between lines and point [global variable?]
    Look for words in columns that are not keywords and make those the vertexlabels

    keyword1Index: 3
    keyword2Index: 1
    keyword3Index: 2
3. Update to d3 v5
4. svg crowbar
5. Upload and submit csv

- cookie: First visit example data, afterwards keep entered text
- On hover of point: highlight lines/values, ? voronoi option visualcinnamon

MAKE IT SLICK
- validate input
- error handling
- option for radius/size of point
- lines
    - end style: arrow-end) https://vanseodesign.com/web-design/svg-markers/
    - fill color & border color
    - curved or straight
- select points and lines
- make animated explanation page
- ??? maybe use something other than textarea
- structure code better https://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
    http://jstherightway.org/#js-code-style
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects
  https://ejb.github.io/2017/08/09/a-better-way-to-structure-d3-code-es6-version.html

VORONOI [does litter in downloaded svg ??]
make it optional

var voronoi = d3.geom.voronoi()
    .x(function(d) { return plotCoords[0]; })
    .y(function(d) { return plotCoords[1]; })
    .clipExtent([[0, 0], [width, height]]);

svg.selectAll("path")
    .data(voronoi(d)) //Use vononoi() with your dataset inside
    .enter().append("path")
    .attr("d", function(d, i) { return "M" + d.join("L") + "Z"; })
    .datum(function(d, i) { return d.point; })
    //Give each cell a unique class where the unique part corresponds
    //to the circle classes
    .attr("class", function(d,i) { return "voronoi " + d.CountryCode; })
    //.style("stroke", "#2074A0") //If you want to look at the cells
    .style("fill", "none")
    .style("pointer-events", "all")
    .on("mouseover", showTooltip)
    .on("mouseout",  removeTooltip);



--------Later Features--------
- hexbin option
- heatmap & contour option

* Download the chart with SVG crowbar
* Hackertip: inspect an element in Chrome dev tool to alter its properties
*/

let defaultPointColor = "black";
let defaultShape = "circle";
let defaultLinestyle = "none";
let defaultLineColor = "black";
// const items = JSON.parse(localStorage.getItem("points")) || [];
labelsAdded = false;

let pointColumns = [];

function capitalize(word) {
  return  word.toLowerCase().replace(/\b[a-z]/g, function(letter) {
       return letter.toUpperCase();
  });
}

const reserved = ["colour", "color", "shape", "linestyle", "title"];

const graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

function resize(t) {
  t.fit(500, 500);
  // t.fit(window.innerWidth,window.innerHeight);
}

var ternary = d3.ternary.plot()
  .call(resize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

d3.select("svg").call(ternary);

/* ------ Lines ------ */
function drawLines(d) {
  // console.log("----------------------------------------------");
  // console.log("DRAWING", d);
  // console.log("----------------------------------------------");

  // const drawArray = d.map(line => line.map(linePoint => { return [linePoint[0], linePoint[2], linePoint[1]] } ));

  const paths = ternary.plot()
    .selectAll(".line")
    .data(d);

  paths.enter().append("path")
      .attr("class", "ternary-line")
      .attr("d", function(line) {
        let drawArray = [];
        const myKeys = Object.keys(line[0]);
        // Loop over each point in line and add to drawarray because d3 path wants it that way
        for (i = 0; i <= (line.length - 1); i+=1) {
          // d3.ternary wants the values swapped ¯\_(ツ)_/¯
          const current = [+line[i][myKeys[0]], +line[i][myKeys[2]], +line[i][myKeys[1]]]; // Better find the index of the columns that aren"t keywords
          drawArray.push(current);
          // maybe old method for non closed lines ?
        };
        // console.log("drawArray", drawArray);
        return ternary.path(drawArray);
      })
      .attr("stroke-dasharray", function(e) { return e[0].linestyle ?  e[0].linestyle.trim().replace("/([\s])+/", ",") : defaultLinestyle })
      .attr("stroke", function(e) { return e[0].color ? (e[0].color).trim() : (e[0].colour ? (e[0].colour).trim() : defaultLineColor)}) // both color and colour are valid   
      .attr("fill", function(e) { return e[0].fillcolor ? (e[0].fillcolor).trim() : undefined})
      .attr("fill-opacity", 0.5)
      .append("title")
        .text( function(e) { return e[0].title ? (e[0].title).trim() : undefined; }); //Object.values(e).slice(0,3).join(", ")

}

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
      .attr("d", symbol.type(function(point) { return point.shape ? (point.shape).trim() : defaultShape; }))
      .attr("transform", function(point) {
        const myKeys = Object.keys(point);
        myValues = [point[myKeys[0]], point[myKeys[2]], point[myKeys[1]]];

        const plotCoords = ternary.point(myValues);
        return "translate(" + plotCoords[0] + "," + plotCoords[1] + ")";
      })
    .append("title")
      .text( function(point) { return point.title ? capitalize(point.title) : undefined; }); //Object.values(e).slice(0,3).join(", ")
}

// Make one function submitted check wether lines or points???
function submittedPoints(e) {
  e.preventDefault();
  const parsedInput = d3.csvParse((this.querySelector("[name=item]")).value.toLowerCase());


  // parsedInput.columns.map(key => {
  //   reserved.forEach(res => {
  //     if (key == res) console.log("key", key, "res", res); }
  //   })
  // });

  // console.log("points cols", parsedInput.columns);


  if (!labelsAdded) { addVertexLabels(parsedInput); labelsAdded = true;}
  drawPoints(parsedInput);
}

// enter lines as csv as well, with certain character for a new line???
function submittedLines(e) {
  e.preventDefault();

  const rawInput = (this.querySelector("[name=item]")).value;
  let splitNewlines = rawInput.split(/([-])+/).map(d => d.split("\n")); // Split by dashes [separate lines to draw], then split by newlines [separate points in each line]
  
  const columnsString = splitNewlines[0].shift(); // Remove first entry (Columns)
  const columnsArray = columnsString.split(","); // Array with column names

  splitNewlines = splitNewlines.map(arr => arr.filter(entry => String(entry) !== "")); // Filter out empty entries
  const lines = splitNewlines.map(point => point.map(value => value.split(",")) );

  // // console.log(columnsArray.indexOf("color"))
  // let intersection = columnsArray.map(x => reserved.indexOf(x)).indexOf(-1);
  // console.log(intersection);

  if (!labelsAdded) { addVertexLabels({columns: columnsArray}); labelsAdded = true;}

  // Its ugly but it works ¯\_(ツ)_/¯
  const lineObjectsArray = lines.map(line => {
    const lineObjects = line.map(function(p) {
      const point = columnsArray.reduce(function(result, column, i) {
        result[column.toLowerCase()] = p[i];
        return result;
      }, {});
      return point
    });
    return lineObjects
  });
  drawLines(lineObjectsArray);
}

function warning(warnString) {
  console.log(warnString);

  const div = d3.select("#warning");

  // div.innerHTML(warnString);
}

function addVertexLabels(f) {
  const cols = (f.columns).slice(0, 3);
  const labels = cols.map(d => { return capitalize(d); });
  ternary.call(d3.ternary.vertexLabels(labels))
}

function clearLabels() {
  d3.selectAll(".vertex-label").remove();
  labelsAdded = false;
}

function clearPoints(e) {
  d3.selectAll(".point").remove();
}

function clearLines(e) {
  d3.selectAll(".ternary-line").remove();
}

function clearAll(e) {
  clearLines();
  clearPoints();
  clearLabels();
}

// Change to oneliners?
const submitPoints = document.querySelector("#enterpoints");
submitPoints.addEventListener("submit", submittedPoints);

const submitLines = document.querySelector("#enterlines");
submitLines.addEventListener("submit", submittedLines);

const clearPointsButton = document.getElementById("clearPoints");
clearPointsButton.addEventListener("click", clearPoints);

const clearLinesButton = document.getElementById("clearLines");
clearLinesButton.addEventListener("click", clearLines);

const clearLabelsButton = document.getElementById("clearLabels");
clearLabelsButton.addEventListener("click", clearLabels);

const clearAllButton = document.getElementById("clearAll");
clearAllButton.addEventListener("click", clearAll);

document.querySelector(`select[name="defaultColorPoints"]`).onchange = pointColorSelect;
document.querySelector(`select[name="defaultShape"]`).onchange = pointShapeSelect;

document.querySelector(`select[name="defaultColorLines"]`).onchange = lineColorSelect;
document.querySelector(`select[name="defaultLineStyle"]`).onchange = linestyleSelect;

const infoPoints = document.getElementById("infopoint");
// clearLinesButton.addEventListener("click", console.log("KKKKKKK"));



function pointColorSelect(event) {
  defaultPointColor = event.target.value;
}

function pointShapeSelect(event) {
  defaultShape = event.target.value;
}

function lineColorSelect(event) {
  defaultLineColor = event.target.value;
}

function linestyleSelect(event) {
  defaultLinestyle = event.target.value;
}


