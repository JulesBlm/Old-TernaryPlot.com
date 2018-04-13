/* To do

- cookie: First visit example data, afterwards keep entered text
- On hover of point: highlight lines/values, voronoi option visualcinnamon
- explain all options for csv
- update to d3 v5
- css + ui design
- upload csv
- validate input
- error handling
- hexbin option
- contour option
- keep track of order of columns beteen lines and points
- heatmap option
- option for radius/size of point
- lines
    - line style ( dotted, stripes, end style: arrow-end)
    - fill color & border color
    - curved or straight
- select points and lines
- Check wether order is the same in lines and points textarea
- make animated explanation page
- ??? look for words in columns that are not keywords and make those the vertexlabels
- ??? maybe use something other than textarea
- structure code better https://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
    http://jstherightway.org/#js-code-style
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects
* Download the chart with SVG crowbar
* Hackertip: inspect an element in Chrome dev tool to alter its properties
*/

let defaultPointColor = "black";
let defaultShape = "circle";
let defaultLinestyle = "1,1";
let defaultLineColor = "black"
// const items = JSON.parse(localStorage.getItem('points')) || [];
labelsAdded = false;

function capitalize(word) {
  return  word.toLowerCase().replace(/\b[a-z]/g, function(letter) {
       return letter.toUpperCase();
  });
}

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
  console.log("----------------------------------------------");
  console.log("DRAWING", d);
  console.log("----------------------------------------------");

  // const drawArray = d.map(line => line.map(linePoint => { return [linePoint[0], linePoint[2], linePoint[1]] } ));

  const paths = ternary.plot()
    .selectAll("path")
    .data(d);

  paths.enter().append('path')
      .attr("class", "ternary-line")
      .attr("d", function(line) {
        let drawArray = [];

        const myKeys = Object.keys(line[0]);

        // console.log("line", line);
        // Loop over each point in line and add to drawarray because d3 path wants it that way
        for (i = 0; i <= (line.length - 1); i+=1) {
          // d3.ternary wants the values swapped ¯\_(ツ)_/¯
          const current = [+line[i][myKeys[0]], +line[i][myKeys[2]], +line[i][myKeys[1]]];
          drawArray.push(current);
          // maybe old method for non closed lines ?
        };

        console.log("drawArray", drawArray);

        return ternary.path(drawArray);
      })
      .attr("stroke-dasharray", function(e) { return e[0].linestyle ?  e[0].linestyle : defaultLinestyle })
      .attr("stroke", function(e) { return e[0].color ? e[0].color : (e[0].colour ? e[0].colour : defaultLineColor)}) // both color and colour are valid   

}

/* ------ Points ------ */
function drawPoints(d) {
  const values = d.slice([0, 3]);
  const symbol = d3.svg.symbol();

  ternary.plot()
    .selectAll(".point")
    .data(values)
    .enter().append("path")
      .attr("class", "point")
      .attr("fill",function(e) { return e.color ? e.color : (e.colour ? e.colour : defaultPointColor)}) // both color and colour are valid
      .attr("d", symbol.type(function(e) { return (e.shape) ? e.shape : defaultShape; }))
      .attr("transform", function(point) {
        const myKeys = Object.keys(point);
        const myValues = [point[myKeys[0]], point[myKeys[2]], point[myKeys[1]]];

        const plotCoords = ternary.point(myValues);
        return "translate(" + plotCoords[0] + "," + plotCoords[1] + ")";
      })
    .append("title")
      .text( function(e) { return e.title ? e.title : JSON.stringify(e); }); //Object.values(e).slice(0,3).join(", ")
}

// Make one function submitted check wether lines or points???
function submittedPoints(e) {
  e.preventDefault();
  const parsedInput = d3.csvParse((this.querySelector('[name=item]')).value);
  if (!labelsAdded) { addVertexLabels(parsedInput); labelsAdded = true;}
  drawPoints(parsedInput);
}

// enter lines as csv as well, with certain character for a new line???
function submittedLines(e) {
  e.preventDefault();

  const rawInput = (this.querySelector("[name=item]")).value;
  let splitNewlines = rawInput.split(/([-])+/).map(d => d.split("\n")); // Split by dashes for separate lines to draw, then split by newlines for separate points
  
  const columnsString = splitNewlines[0].shift(); // Remove first entry (Columns)
  const columnsArray = columnsString.split(","); // Array with column names

  splitNewlines = splitNewlines.map(arr => arr.filter(entry => String(entry) !== '')); // Filter out empty entries
  // console.log("splitNewlines", splitNewlines);

  const lines = splitNewlines.map(point => point.map(value => value.split(",")) );
  console.log("lines", lines);

  if (!labelsAdded) { addVertexLabels({columns: columnsArray}); labelsAdded = true;}

  // Its ugly but it works ¯\_(ツ)_/¯
  // Values array van elke lijn pushen aan drawArray.
  const lineObjectsArray = lines.map(line => {

    const lineObjects = line.map(function(p) {

      const point = columnsArray.reduce(function(result, column, i) {
        result[column] = p[i];
        return result;
      }, {})

      return point
    })

    return lineObjects
  })
  drawLines(lineObjectsArray);
}

/* Should like like
linetodraw = {color: "yellow", values: [point1, point2, point3], linestyle: "dashed"}

*/

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
const submitPoints = document.querySelector('#enterpoints');
submitPoints.addEventListener('submit', submittedPoints);

const submitLines = document.querySelector('#enterlines');
submitLines.addEventListener('submit', submittedLines);

const clearPointsButton = document.getElementById('clearPoints');
clearPointsButton.addEventListener('click', clearPoints);

const clearLinesButton = document.getElementById('clearLines');
clearLinesButton.addEventListener('click', clearLines);

const clearLabelsButton = document.getElementById('clearLabels');
clearLabelsButton.addEventListener('click', clearLabels);

const clearAllButton = document.getElementById('clearAll');
clearAllButton.addEventListener('click', clearAll);

document.querySelector(`select[name="defaultColorPoints"]`).onchange = pointColorSelect;
document.querySelector(`select[name="defaultShape"]`).onchange = pointShapeSelect;

document.querySelector(`select[name="defaultColorLines"]`).onchange = lineColorSelect;
document.querySelector(`select[name="defaultLineStyle"]`).onchange = linestyleSelect;


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

/* EXPLANATION 
https://bost.ocks.org/mike/transition/#life-cycle

*/
function explain() {
  // On the side dynamic update of current composition of point
  // - Sand : 80%
  // - Silt : 10%
  // - Clay : 10%
  // move point around with mouse?

  // A ternary plot is useful chart for vizualing three variables which sum to a constant.
  // Suppose we have a soil sample that consists of three soil types: sand, silt and clay. These three form 100% of our soil sample.
  ternary.call(d3.ternary.vertexLabels(['Sand', 'Silt', 'Clay'])); // transition??

  // We have three axes, one for each component
  // - thicken each axis omstebeurt + vertexLabel
  // - Show arrow from corner to opposite side
  // - or, even better, highlight each major axis and its percentages + ticks for each component sequentially.
  // give <g> and id then select each major axis

  // If our object consists 100% Sand then were all the way in the 'Sand' corner
  // - plot point 100% sans
  // Same goes for the other two components of course but lets focus on the sand corner for now

  // Now what if we have 80% sand and 20%, well, something else.
  // - move point to 80%, 20% clay

  // See that the point has moved closer to the 'Clay' corner, and on the 'Clay axis'. Now lets add some silt in the mix
  // - move point to 80%, 10% clay 10% silt
  // - Show line to that clay and silt axes 10 % 

  // Notice that we're still on the 80% Sand line
  // - make 80% sand line red
  // Everywhere on this red line our soil sample is 80% sand



};