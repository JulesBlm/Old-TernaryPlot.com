/* To do

- !!!SWITCH VALUES ORDER WRONGLY PLOTTED!!!
- explain all options for csv
- update to d3 v5
- change structure of entering point feels tedious
- shape of point [square, star, circle]
- css + design
- upload csv
- validate input
- error handling
- option for radius/size of point
- lines
    - line style ( dotted, stripes, end style: arrow-end)
    - fill color & border color
    - curved or straight
- select points and lines
- make animated explanation page
- ??? look for words in columns that are not keywords and make those the vertexlabels
- ??? maybe use something other than textarea 
- structure code better https://css-tricks.com/how-do-you-structure-javascript-the-module-pattern-edition/
    http://jstherightway.org/#js-code-style
    https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects

* Download the chart with SVG crowbar
* Hackertip: inspect an element in Chrome dev tool to alter its properties
*/

const addPoints = document.querySelector('#enterpoints');
const addLines = document.querySelector('#enterlines');
const items = JSON.parse(localStorage.getItem('points')) || [];
labelsAdded = false;

function capitalize(word) {
  return  word.toLowerCase().replace(/\b[a-z]/g, function(letter) {
       return letter.toUpperCase();
  });
}

var graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

function resize(t) {
  t.fit(500, 500);
  // t.fit(window.innerWidth,window.innerHeight);
};

var ternary = d3.ternary.plot()
  .call(resize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

d3.select("svg").call(ternary);

/* ------ Lines ------ */
function drawLines(d) {
  dataLines = d3.entries(d).map(function(e) {
    v = e.value.map( function(f) { return [f.silt, f.sand, f.heavy]; });
    return { type: d.key, value: v };
  });
  paths = ternary.plot()
    .selectAll("path")
    .data(dataLines);

  paths
    .enter().append('path')
      .attr("class", "ternary-line")
      .attr("id", function(d) { return d.type.replace('-', '') } )
      .attr("d",function(d) {
        return ternary.path(d.value);        
      })
    .insert("text")
      .text( function (d) { return this.id; })
}

/* ------ Points ------ */
function drawPoints(d) {
  const values = d.slice([0, 3]);
  const standardSymbol = "circle";
  const symbol = d3.svg.symbol();

  ternary.plot()
    .selectAll(".point")
    .data(values)
    .enter().append("path")
      .attr("class", "point")
      .attr("fill",function(e) { return (e.color) ? (e.color) : (e.colour ? e.colour : "#000")}) // both color and colour are valid
      .attr("d", symbol.type(function(e) { return (e.shape) ? e.shape : standardSymbol; }))
      .attr("transform", function(e) {
        // currentValue = Object.values(e);
        const myKeys = Object.keys(e);
        const myValues = [e[myKeys[0]], e[myKeys[2]], e[myKeys[1]]];

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
  const rawInput = (this.querySelector('[name=item]')).value;
  const splitDash = rawInput.split('-');
  let splitNewline = splitDash.map(d => d.split('\n'));
  splitNewline = splitNewline.map(d=> d.filter(Boolean));

  console.log(d3.csvParse(splitNewline));
  // splitNewline.forEach(d => console.log(d3.csvParse(d)) );
  // drawLines(parsedInput);
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

addPoints.addEventListener('submit', submittedPoints);
addLines.addEventListener('submit', submittedLines);

const clearPointsButton = document.getElementById('clearPoints');
clearPointsButton.addEventListener('click', clearPoints);

const clearLinesButton = document.getElementById('clearLines');
clearLinesButton.addEventListener('click', clearLines);

const clearLabelsButton = document.getElementById('clearLabels');
clearLabelsButton.addEventListener('click', clearLabels);

const clearAllButton = document.getElementById('clearAll');
clearAllButton.addEventListener('click', clearAll);


d3.select

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