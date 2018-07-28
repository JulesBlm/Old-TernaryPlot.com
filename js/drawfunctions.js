let defaultPointColor = "black";
let defaultShape = "circle";

let defaultLinestyle = "none"; //solid
let defaultLineColor = "black";
let defaultStrokewidth = "4px";

let defaultAreaColor = "gold";
let defaultAreaOpacity = 0.2;


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
      .attr("stroke-dasharray", function(line) { return line[0].linestyle ?  line[0].linestyle.trim() : defaultLinestyle })
      .attr("stroke", function(line) { return line[0].color ? (line[0].color).trim() : (line[0].colour ? (line[0].colour).trim() : defaultLineColor)}) // both color and colour are valid   
      .attr("stroke-opacity", function(line) { return line[0].opacity ?  line[0].opacity.trim() : 1 })
      .attr("fill-opacity", "0") // So no inside fill shows up inside lines in Adobe Illustrator 
      .attr("stroke-width", function(line) { return line[0].strokewidth ? line[0].strokewidth : defaultStrokewidth })
      .append("title") // 🤔 Would there be a way to not append a title if there is none?
        .text( function(line) { return line[0].title ? capitalize((line[0].title).trim()) : undefined; }); //Object.values(e).slice(0,3).join(", ")
}

/* ------ Areas ------ */
function drawAreas(d) {
  // console.log("drawareas", d);

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
      .attr("z-index", -1)
      .attr("fill", function(area) { return area[0].color ? (area[0].color).trim() : defaultAreaColor })
      .attr("fill-opacity", function(area) { return area[0].opacity ?  area[0].opacity : 0.5 })
      .append("title")
        .text( function(area) { return area[0].title ? capitalize((area[0].title).trim()) : undefined; });
}