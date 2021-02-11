/* eslint-disable no-restricted-syntax */
/* eslint-disable max-len */
/* eslint-disable indent */
/* eslint-disable no-nested-ternary */
import d3 from "d3";
import swal from "sweetalert";
import "./ternary.v3";
import {
  resize,
  capitalize,
  removeTrailingElements,
  getDrawArray,
} from "./helpers";

const graticule = d3.ternary.graticule().majorInterval(0.2).minorInterval(0.05);

const initialPlotSize =
  window.innerWidth > 500 ? [500, 500] : [window.innerWidth, window.innerWidth];

const ternary = d3.ternary
  .plot()
  .call(resize, initialPlotSize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.neatline())
  .call(graticule);

/* TODO: Not use these as globals */
let labelsAdded = false;
let columns;

const reserved = [
  "colour",
  "color",
  "shape",
  "linestyle",
  "title",
  "opacity",
  "strokewidth",
  "opacity",
];

function addVertexLabels(f) {
  const cols = f.columns.slice(0, 3);
  ternary.call(d3.ternary.vertexLabels(cols));
}

function clearLabels() {
  d3.selectAll(".vertex-label").remove();
  labelsAdded = false;
  columns = undefined;
}

// Check if lines column names match with previous column names
function checkColumns(columnNames) {
  if (!columns) {
    columns = columnNames.slice(0, 3);

    // Add labels to ternary plot
    if (!labelsAdded) {
      addVertexLabels({ columns: columnNames });
      labelsAdded = true;
    }
  } else if (
    JSON.stringify(columnNames.slice(0, 3)) !== JSON.stringify(columns)
  ) {
    const labelsMessage = document.createElement("div");
    labelsMessage.innerHTML = `The current labels are <code>'${columns}'</code> and you're now trying to plot data with columns <code>'${columnNames.slice(
      0,
      3
    )}'</code>. Your data will still be plotted, but it might not appear the way you intended. <br> Try clicking the <input type="button" id="specialClearLabels" aria-label="Remove Labels" value="Remove Labels"> button and plotting again.`;
    swal({
      title:
        "Your columns names entered in the Points, Lines and Areas tables don't seem to match",
      content: labelsMessage,
      icon: "warning",
    });

    const specialClearLabel = document.getElementById("specialClearLabels");
    specialClearLabel.addEventListener("click", clearLabels);
  }
  // Check for reserved keywords in column names
  columns
    .filter((key) => reserved.includes(String(key).toLowerCase()))
    .some(() => {
      return swal(
        "Reserved column name",
        `You can't use any of the following names as your columns names (i.e. the first three columns): ${reserved.join(
          ", "
        )}`,
        "error"
      );
    });
}

function showHelpLines(e) {
  const [a, b, c] = Object.values(e);
  const pointValues = [a, c, b];

  // Its ugly but it works is my motto for programming
  const helpLinesArray = [
    [pointValues, [0, parseFloat(a) + parseFloat(c), parseFloat(b)]],
    [pointValues, [parseFloat(a), 0, parseFloat(c) + parseFloat(b)]],
    [pointValues, [parseFloat(a) + parseFloat(b), parseFloat(c), 0]],
  ];

  const helpLines = ternary.plot().selectAll(".line").data(helpLinesArray);

  // I could (should?) use the linesToDraw function but that one is geared towards the submmittedLines format and this is easier🤗
  helpLines
    .enter()
    .append("path")
    .attr("class", "help-line")
    .attr("d", (line) => ternary.path(line))
    .attr("stroke-dasharray", "3, 3, 3")
    .attr("stroke", "black")
    .attr("stroke-width", "1px")
    .attr("z-index", "-1");
}

const isNullArray = (arr) => arr.every((d) => d === null);

const Parse = {
  Points(data) {
    let rows = data;
    let columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map((line) => removeTrailingElements(line));

    // Remove trailing empty strings and nulls from columns array
    columnsArray = removeTrailingElements(columnsArray);

    // Filter all empty line arrays
    rows = rows.filter((d) => !isNullArray(d));

    // TODO: Rewrite this monster
    // Construct array of object with properties for drawing
    // Its ugly but it works ¯\_(ツ)_/¯
    const objectsArray = rows.map((line) => {
      const point = columnsArray.reduce((result, column, i) => {
        const pointValue = result;
        const columnString = String(column).toLowerCase();
        pointValue[columnString] = line[i];
        return pointValue;
      }, {});
      return point;
    });

    return objectsArray;
  },

  LinesAreas(data) {
    // debugger;
    const rows = [...data];
    let columnsArray = rows.shift();

    checkColumns(columnsArray);

    // Remove trailing empty strings and nulls from line array
    rows.map(removeTrailingElements);

    // Remove trailing empty strings and nulls from columns array
    columnsArray = removeTrailingElements(columnsArray);

    const linesToDraw = [];
    {
      let drawLine = [];

      // Loop over rows array
      for (const point of rows) {
        if (!isNullArray(point)) {
          drawLine.push(point); // Add to drawLine
        } else if (isNullArray(point)) {
          // When an empty row is encountered, use it as a separator. clear drawLine array to start new one
          if (drawLine.length !== 0) {
            linesToDraw.push(drawLine);
          }
          drawLine = []; // Reset drawLine
        }
      }
    }

    // TODO: Don't repeat the monster reducer!
    const objectsArray = linesToDraw.map((line) => {
      const lineObjects = line.map((p) => {
        const point = columnsArray.reduce((result, column, i) => {
          const linePointValue = result;
          const columnString = String(column).toLowerCase();
          linePointValue[columnString] = p[i];
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
    pointColor: "black",
    pointShape: "circle",
    pointSize: 70,
    lineStyle: "none", // solid
    lineColor: "black",
    lineStrokewidth: "4px",
    areaColor: "gold",
    areaOpacity: 0.2,
  },

  // Set listeners for selection of default draw properties
  setListeners() {
    document.querySelector("#defaultColorPoints").onchange = ({ target }) => {
      Draw.defaults.pointColor = target.value;
    };
    document.querySelector("select[name='defaultShape']").onchange = ({
      target,
    }) => {
      Draw.defaults.pointShape = target.value;
    };
    document.querySelector("#defaultPointsize").onchange = ({ target }) => {
      Draw.defaults.pointSize = target.value;
    };

    document.querySelector("#defaultColorLines").onchange = ({ target }) => {
      Draw.defaults.lineColor = target.value;
    };
    document.querySelector("select[name='defaultLineStyle']").onchange = ({
      target,
    }) => {
      Draw.defaults.lineStyle = target.value;
    };
    document.querySelector("#defaultLinewidth").onchange = ({ target }) => {
      Draw.defaults.lineStrokewidth = target.value;
    };

    document.querySelector("#defaultColorAreas").onchange = ({ target }) => {
      Draw.defaults.areaColor = target.value;
    };
    document.querySelector("select[name='defaultAreaOpacity']").onchange = ({
      target,
    }) => {
      Draw.defaults.areaOpacity = target.value;
    };
  },

  Points(tableValues) {
    const values = tableValues.slice([0, 3]); // Take only first three columns of table
    const symbol = d3.svg.symbol();

    const points = ternary.plot().selectAll(".point").data(values);

    points
      .enter()
      .append("path")
      .attr("class", "point")
      .attr("fill", (point) =>
        point.color
          ? point.color.trim()
          : point.colour
          ? point.colour.trim()
          : Draw.defaults.pointColor
      ) // both color and colour are valid
      .attr("fill-opacity", ({ opacity }) => opacity || 1)
      .attr(
        "d",
        symbol
          .type(({ shape }) =>
            shape ? shape.trim() : Draw.defaults.pointShape
          ) // use this?
          .size(({ size }) => size || Draw.defaults.pointSize)
      )
      .attr("transform", (point) => {
        const [a, b, c] = Object.values(point);
        const myPointValues = [a, c, b];
        const [plotCoordA, plotCoordB] = ternary.point(myPointValues); // Convert to barycentric coordinates
        return `translate(${plotCoordA},${plotCoordB})`;
      })
      .on("mouseover", showHelpLines)
      .on("mouseout", () => {
        d3.selectAll(".help-line").remove();
      })
      .append("title")
      .text((point) => {
        const [valueA, valueB, valueC] = Object.values(point);
        if (!valueA && !valueB && !valueC) {
          return "";
        }
        const [a, b, c] = Object.entries(point); // Just get the points coords

        const valuesString = `${a.join(": ")}\n${b.join(": ")}\n${c.join(
          ": "
        )}`; // ehh sure why not
        return point && point.title
          ? `${capitalize(point.title.trim())}\n${valuesString}`
          : valuesString;
      });
  },

  Lines(tableValues) {
    const paths = ternary.plot().selectAll(".line").data(tableValues);

    const strokedashDict = {
      dotted: "3 2",
      "dot-dash": "10 3 4 3",
      "dot-dot-dash": "10 3 4 3 4 3",
      "short-dashed": 4,
      "medium-dashed": 17,
      "long-dashed": 26,
    };

    // 🤔I think there must be a way to do this 'better' with Object methods
    paths
      .enter()
      .append("path")
      .attr("class", "ternary-line")
      .attr("d", (line) => {
        const drawArray = getDrawArray(line);
        return ternary.path(drawArray);
      })
      .attr("stroke-dasharray", ([{ linestyle }]) =>
        linestyle ? strokedashDict[linestyle] : Draw.defaults.lineStyle
      ) // (line[0].linestyle).trim()
      .attr("stroke", ([firstPoint]) =>
        firstPoint.color
          ? firstPoint.color.trim()
          : firstPoint.colour
          ? firstPoint.colour.trim()
          : Draw.defaults.lineColor
      ) // both color and colour are valid
      .attr("stroke-opacity", ([{ opacity }]) => (opacity ? opacity.trim() : 1))
      .attr("fill-opacity", "0") // So no inside fill shows up inside lines in Adobe Illustrator
      .attr(
        "stroke-width",
        ([{ strokewidth }]) => strokewidth || Draw.defaults.lineStrokewidth
      )
      .filter(([{ title }]) => title)
      .append("title")
      .text(([{ title }]) => capitalize(title.toString().trim())); // Object.values(e).slice(0,3).join(', ')
  },

  // Takes in data entered in the Areas Table and draws them onto the Ternary Plot
  Areas(tableValues) {
    const paths = ternary.plot().selectAll(".area").data(tableValues);

    paths
      .enter()
      .append("path")
      .attr("class", "ternary-area")
      .attr("d", (line) => {
        const drawArray = getDrawArray(line);
        return ternary.area(drawArray);
      })
      .attr("z-index", -1)
      .attr("fill", ([firstLine]) =>
        firstLine.color
          ? firstLine.color.trim()
          : firstLine.colour
          ? firstLine.colour.trim()
          : Draw.defaults.lineColor
      ) // both color and colour are valid
      .attr("fill-opacity", ([{ opacity }]) => opacity || 0.5)
      .filter(([{ title }]) => title)
      .append("title")
      .text(([{ title }]) => capitalize(title.toString().trim()));
  },
};

const ternaryPlotElement = d3.select("#ternary-plot");

// append white background for png download
ternaryPlotElement
  .append("rect")
  .attr("fill", "white")
  .attr("width", initialPlotSize[0])
  .attr("height", initialPlotSize[1]);

ternaryPlotElement.call(ternary);
window.addEventListener("resize", resize(ternary));

export { Parse, Draw, clearLabels };
