// when updated to d3 v5 only import d3.svg, d3.select, d3.scale, d3.dispatch, d3.sum is all we need
import d3 from "d3";
import Handsontable from "Handsontable";
import swal from 'sweetalert';
import './ternary.v3';

// If localstorage dont show message
// if (document.cookie.split(';').filter((item) => item.includes('visited=true')).length) {
//   document.querySelector("#id").remove();
// } else {
//   document.cookie = "visited=true";
// }

let labelsAdded = false;
let columns;
const reserved = ["colour", "color", "shape", "linestyle", "title", "opacity"];

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

const parse = {

  Points : function(data) {
    let lines = data;
    const columnsArray = lines.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    lines.map(line => {
      while(line[line.length - 1] === null || line[line.length - 1] === ""){  // While the last element is a null or empty string
        line.pop(); // Remove that last element
      }
      return line;
    })

    // Filter all empty line arrays
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
  },

  LinesAreas: function(data) {
    let lines = data;
    const columnsArray = lines.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    lines.map(line => {
      while(line[line.length - 1] === null || line[line.length - 1] === ""){  // While the last element is a null or empty string
        line.pop();                           // Remove that last element
      }
      return line;
    })

    const drawLines = [];

    let drawLine = [];
    // Loop over lines array
    for (let i = 0; i < lines.length; i++) {
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
};

const Draw = {

  defaults : {
      pointColor : "black",
      pointShape : "circle",
      pointSize : 70,
      lineStyle : "none", //solid
      lineColor : "black",
      lineStrokewidth : "4px",
      areaColor : "gold",
      areaOpacity : 0.2
  },

  setListeners : function() {
    document.querySelector(`select[name="defaultColorPoints"]`).onchange = function() { Draw.defaults.pointColor = event.target.value; };
    document.querySelector(`select[name="defaultShape"]`).onchange = function() { Draw.defaults.pointShape = event.target.value; };

    document.querySelector(`select[name="defaultColorLines"]`).onchange = function() { Draw.defaults.lineColor = event.target.value; };
    document.querySelector(`select[name="defaultLineStyle"]`).onchange = function() { Draw.defaults.lineStyle = event.target.value; };

    document.querySelector(`select[name="defaultColorAreas"]`).onchange = function() { Draw.defaults.areaColor = event.target.value; }
    document.querySelector(`select[name="defaultAreaOpacity"]`).onchange = function() { Draw.defaults.areaOpacity = event.target.value; }
  },
    
  Points: function(d) {
    const values = d.slice([0, 3]);
    const symbol = d3.svg.symbol();
    let myValues;

    const points = ternary.plot()
      .selectAll(".point")
      .data(values);

    points.enter().append("path")
        .attr("class", "point")
        .attr("fill", function(point) { return point.color ? (point.color).trim() : (point.colour ? (point.colour).trim() : Draw.defaults.pointColor); }) // both color and colour are valid
        .attr("fill-opacity", function(point) { return point.opacity ? point.opacity : 1; }) 
        .attr("d", symbol
                    .type(function(point) { return point.shape ? (point.shape).trim() : Draw.defaults.pointShape; })
                    .size(function(point) { return point.size ? point.size : Draw.defaults.pointSize; })
        )
        .attr("transform", function(point) {
          const myKeys = Object.keys(point); //Move outside?
          myValues = [point[myKeys[0]], point[myKeys[2]], point[myKeys[1]]];

          const plotCoords = ternary.point(myValues);
          return `translate(${plotCoords[0]},${plotCoords[1]})`;
        })
        .on("mouseover", showHelpLines)
        .on("mouseout", function(e) { d3.selectAll(".help-line").remove() })
      .append("title")
        .text( function(point) { 
          const myKeys = Object.keys(point);
          const valuesString = `${capitalize(myKeys[0])}: ${point[myKeys[0]]}, ${capitalize(myKeys[2])}: ${point[myKeys[2]]}, ${capitalize(myKeys[1])}: ${point[myKeys[1]]}`;
          return point.title ? `${capitalize(point.title.trim())}; ${valuesString}` : valuesString;
        });
  },

  Lines : function(d) {
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
          }
          return ternary.path(drawArray);
        })
        .attr("stroke-dasharray", function(line) { return line[0].linestyle ?  (line[0].linestyle).trim() : Draw.defaults.lineStyle })
        .attr("stroke", function(line) { return line[0].color ? (line[0].color).trim() : (line[0].colour ? (line[0].colour).trim() : Draw.defaults.lineColor); }) // both color and colour are valid   
        .attr("stroke-opacity", function(line) { return line[0].opacity ?  (line[0].opacity).trim() : 1; })
        .attr("fill-opacity", "0") // So no inside fill shows up inside lines in Adobe Illustrator 
        .attr("stroke-width", function(line) { return line[0].strokewidth ? line[0].strokewidth : Draw.defaults.lineStrokewidth; })
        .append("title") // 🤔 Would there be a way to not append a title if there is none?
          .text( function(line) { return line[0].title ? capitalize((line[0].title).trim()) : undefined; }); //Object.values(e).slice(0,3).join(", ")
  },

  // Takes in data entered in the Areas Table and draws them onto the Ternary Plot
  Areas : function(d) {
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
          }
          return ternary.area(drawArray);
        })
        .attr("z-index", -1)
        .attr("fill", function(area) { console.log(Draw.defaults.areaColor); return area[0].color ? (area[0].color).trim() : Draw.defaults.areaColor; })
        .attr("fill-opacity", function(area) { return area[0].opacity ?  area[0].opacity : 0.5; })
        .append("title")
          .text( function(area) { return area[0].title ? capitalize((area[0].title).trim()) : undefined; });
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
    persistentState: true
  });  
}

// Check if there is anything in localstorage
const localStoragePoints = localStorage.getItem("points");

const pointsSampleData = [
  ["Sand", "Silt", "Clay", "Color", "Shape", "Size", "Opacity", "Title"],
  [0.3, 0.3, 0.4, "limegreen", , , 1,"Sample Nr 1"],
  [1,0,0],
  [0,1,0],
  [0,0,1],
  [0.2,0.5,0.3,"coral",,800,0.5,"Half opacity big point"],
  [0.3, 0.1, 0.6,"magenta","cross"],
  [0.5,0.5,0,"#d1b621","diamond"],
  [0.6,0.2,0.2,"peru","triangle-up"]
];

let pointsData;
if (localStoragePoints) {
  pointsData = JSON.parse(localStoragePoints)
} else {
  pointsData = pointsSampleData;
}

// Handsontable.hooks.persistentStateSave("points");

const pointsPlaceholder = ["Variable 1", "Variable 2", "Variable 3", "Color", "Shape", "Size", "Opacity", "Title"];

const pointsTable = HandsOnTableCreator(document.getElementById("pointsTable"), pointsData, pointsPlaceholder);
const submitPointsButton = document.enterPoints;

// Not sure about this part yet
// pointsTable.updateSettings({
//   cells: function (row, col) {
//     var cellProperties = {};

//     if (reserved.includes(pointsTable.getData()[row][col])) {
//       cellProperties.readOnly = true;
//     }

//     return cellProperties;
//   }
// });

Handsontable.dom.addEvent(submitPointsButton, "submit", function(e) {
  e.preventDefault();

  const parsedPoints = parse.Points(pointsTable.getData());
  Draw.Points(parsedPoints);
});

const linesSampledata = [
  ["Sand", "Silt", "Clay", "Color", "Linestyle", "Strokewidth", "Title"],
  [0.2,0.8,0,"orangered","5 3 5",2,"dotted line 1"],
  [0.8,0,0.2,],
  [],
  [0.1,0.1,0.8,"slateblue"],
  [0.4,0.1,0.5],
  [0,0,1]
];

const linesPlaceholder = ["Variable 1", "Variable 2", "Variable 3", "Color", "Linestyle", "Strokewidth", "Title"];

const linesTable = HandsOnTableCreator(document.getElementById("linesTable"), linesSampledata, linesPlaceholder);
const submitLinesButton = document.enterLines;
Handsontable.dom.addEvent(submitLinesButton, "submit", function(e) {
  e.preventDefault();

  const parsedLines = parse.LinesAreas(linesTable.getData());

  Draw.Lines(parsedLines);
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
const areasPlaceholder = ["Variable 1", "Variable 2", "Variable 3", "Color", "Opacity", "Title"];

var areasTable = HandsOnTableCreator(document.getElementById("areasTable"), areasSampledata, areasPlaceholder);
const submitAreasButton = document.enterAreas;
Handsontable.dom.addEvent(submitAreasButton, "submit", function(e) {
  e.preventDefault();

  const parsedAreas = parse.LinesAreas(areasTable.getData());
  Draw.Areas(parsedAreas);
});

function capitalize(word) {
  return word.toLowerCase().replace(/\b[a-z]/g, function(letter) {
       return letter.toUpperCase();
  });
}

const graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

const ternary = d3.ternary.plot()
  .call(resize, [500, 500])
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

d3.select("#ternary-plot").call(ternary);

function showHelpLines(e) { 
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

function resize(t) {
  if ( window.innerWidth > 600) { t.fit(500, 500); }
  else { t.fit(window.innerWidth, window.innerHeight); }
};

const timeOutTime = 600;

const clearPointsButton = document.getElementById("clearPoints");
clearPointsButton.addEventListener("click", clearPoints );
clearPointsButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".point")
    .attr("opacity", "0.4");

  setTimeout(function() {
    d3.selectAll(".point")
      .attr("opacity", "1");
  }, timeOutTime);  
});

const clearLinesButton = document.getElementById("clearLines");
clearLinesButton.addEventListener("click", clearLines );
clearLinesButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-line")
    .attr("stroke-opacity", "0.3");

  setTimeout(function() {
    d3.selectAll(".ternary-line")
      .attr("stroke-opacity", "1");
  }, timeOutTime);  
});

const clearAreasButton = document.getElementById("clearAreas");
clearAreasButton.addEventListener("click", clearAreas ); //.remove() );
clearAreasButton.addEventListener("mouseover", function(event) {
  d3.selectAll(".ternary-area")
    .attr("fill-opacity", "0.1");

  setTimeout(function() {
    d3.selectAll(".ternary-area")
      .attr("fill-opacity", "1");
  }, timeOutTime);  
});

const clearLabelsButton = document.getElementById("clearLabels");
clearLabelsButton.addEventListener("click", clearLabels );
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
clearAllButton.addEventListener("click", clearAll );
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

window.addEventListener("resize", resize(ternary))