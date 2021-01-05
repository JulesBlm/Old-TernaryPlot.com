/* eslint-disable quotes */
/* eslint-disable no-eval */
/* eslint-disable max-len */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
/* eslint-disable no-sparse-arrays */
// when updated to d3 v5 only import d3.svg, d3.select, d3.scale, d3.dispatch, d3.sum will be all we need
import d3 from "d3";
import Handsontable from "handsontable";
import swal from "sweetalert";
import * as Sentry from "@sentry/browser";
import downloadSvg, { downloadPng } from "svg-crowbar";
import { Draw, Parse, clearLabels } from "./DrawParse";

import "../css/style.scss";
import "handsontable/dist/handsontable.full.min.css";

// Sentry.init({
//   dsn: SENTRY,
//   release: `ternaryplot.com/${process.env.npm_package_version}`,
// });

// Don't show intro popup within 2 days of a visit
if (
  document.cookie.split(";").filter((item) => item.includes("visited=true"))
    .length
) {
  document.querySelector("#intro").remove(); // style = 'visibility: hidden; opacity: 0;transition: visibility 0s linear 0.15s, opacity 0.15s linear';
} else {
  const removeIntroButton = document.getElementById("closeIntro");
  removeIntroButton.addEventListener("click", () => {
    removeIntroButton.parentElement.remove();
  });

  const now = new Date();
  now.setDate(now.getDate() + 2);
  document.cookie = `visited=true;expires=${now}`;
}

function clear(className) {
  d3.selectAll(className).remove();
}

function clearAll() {
  clear(".ternary-line,.ternary-area,.point");
  clearLabels();
}

// Function to make empty cells grey
function emptyCellRenderer(instance, td, row, col, prop, value) {
  // cellProperties
  Handsontable.renderers.TextRenderer.apply(this, arguments); //

  if (row > 0) {
    if (value === null || value === "") {
      td.style.background = "#efefef";
    }
  }
}

function firstRowRenderer(instance, td) {
  // row, col, prop, value, cellProperties
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.fontWeight = "bold";
  td.style.background = "#f0f8ff";
  td.className = "keep-blue";
}

const initialTableSize = window.innerWidth > 500 ? 500 : window.innerWidth - 20;

// maps function to lookup string
Handsontable.renderers.registerRenderer("emptyCellRenderer", emptyCellRenderer);
Handsontable.renderers.registerRenderer("firstRowRenderer", firstRowRenderer);

function createHandsOnTable(ID, placeholder, HOTcolumns) {
  const tableContainer = document.getElementById(ID)
  return new Handsontable(tableContainer, {
    colHeaders: placeholder,
    columns: HOTcolumns,
    fixedRowsTop: 1,
    rowHeaders: true,
    minRows: 125,
    height: 350,
    width: initialTableSize,
    manualRowMove: true,
    dropdownMenu: true,
    manualColumnResize: true,
    licenseKey: "non-commercial-and-evaluation",
    cells(row) {
      // row, col
      const cellProperties = {};
      // const data = this.instance.getData();
      if (row === 0) {
        cellProperties.renderer = "firstRowRenderer";
      } else {
        cellProperties.renderer = "emptyCellRenderer"; // uses lookup map
      }
      return cellProperties;
    },
    afterChange() {
      const storageKey = ID;
      if (this.getData()[0][0]) {
        localStorage[storageKey] = JSON.stringify(this.getData());
      }
    },
  });
}

const pointColumns = [
  { type: "numeric" },
  { type: "numeric" },
  { type: "numeric" },
  {},
  {
    type: "dropdown",
    source: ["circle", "cross", "diamond", "triangle-down", "triangle-up"],
  },
  { type: "numeric" },
  { type: "numeric" },
  {},
];

/* Points Table */

const pointsPlaceholder = [
  "Variable 1",
  "Variable 2",
  "Variable 3",
  "Color",
  "Shape",
  "Size",
  "Opacity",
  "Title",
];
const pointsLabels = pointsPlaceholder.slice(0, 3);

const pointsTable = createHandsOnTable(
  "pointsTable",
  pointsLabels,
  pointColumns
);
const plotPointsButton = document.getElementById("plotPoints");

Handsontable.dom.addEvent(plotPointsButton, "click", (e) => {
  e.preventDefault();
  clear(".point");

  const parsedPoints = Parse.Points(pointsTable.getData());

  Draw.Points(parsedPoints);
});

/* Lines Table */

const linesPlaceholder = [
  "Variable 1",
  "Variable 2",
  "Variable 3",
  "Color",
  "Linestyle",
  "Strokewidth",
  "Title",
];
const linesLabels = linesPlaceholder.slice(0, 3);

const linesColumns = [
  { type: "numeric" },
  { type: "numeric" },
  { type: "numeric" },
  {},
  {
    type: "dropdown",
    source: [
      "dotted",
      "dot-dash",
      "dot-dot-dash",
      "short-dashed",
      "medium-dashed",
      "long-dashed",
    ],
  },
  { type: "numeric" },
  {},
];

const linesTable = createHandsOnTable("linesTable", linesLabels, linesColumns);
const plotLinesButton = document.getElementById("plotLines");
Handsontable.dom.addEvent(plotLinesButton, "click", (e) => {
  e.preventDefault();
  clear(".ternary-line");

  const linesTableData = linesTable.getData();
  const parsedLines = Parse.LinesAreas(linesTableData);

  Draw.Lines(parsedLines);
});

/* Lines Table */

const areasPlaceholder = [
  "Variable 1",
  "Variable 2",
  "Variable 3",
  "Color",
  "Opacity",
  "Title",
];
const areaLabels = areasPlaceholder.slice(0, 3);

const areasColumns = [
  { type: "numeric" },
  { type: "numeric" },
  { type: "numeric" },
  {},
  {},
  {},
];

const areasTable = createHandsOnTable("areasTable", areaLabels, areasColumns);
const plotAreasButton = document.getElementById("plotAreas");
Handsontable.dom.addEvent(plotAreasButton, "click", (e) => {
  e.preventDefault();
  clear(".ternary-area");
  const parsedAreas = Parse.LinesAreas(areasTable.getData());
  Draw.Areas(parsedAreas);
});

/* Load example or no data */

const loadDataToTables = (pointsData, linesData, areasData) => {
  pointsTable.loadData(pointsData);
  linesTable.loadData(linesData);
  areasTable.loadData(areasData);
};

const loadSampleData = () => {
  const pointsData = [
    [
      "1. Sand",
      "2. Silt",
      "3. Clay",
      "Color",
      "Shape",
      "Size",
      "Opacity",
      "Title",
    ],
    [0.3, 0.3, 0.4, "limegreen", , , 1, "Sample Nr 1"],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [0.2, 0.5, 0.3, "coral", , 800, 0.5, "Half opacity big point"],
    [0.3, 0.1, 0.6, "magenta", "cross"],
    [0.5, 0.5, 0, "#d1b621", "diamond"],
    [0.6, 0.2, 0.2, "peru", "triangle-up"],
  ];
  const linesData = [
    [
      "1. Sand",
      "2. Silt",
      "3. Clay",
      "Color",
      "Linestyle",
      "Strokewidth",
      "Title",
    ],
    [0.2, 0.8, 0, "orangered", "dot-dash", 2, "Dotted line #1"],
    [0.8, 0, 0.2],
    [],
    [0.1, 0.1, 0.8, "slateblue"],
    [0.4, 0.1, 0.5],
    [0, 0, 1],
  ];
  const areasData = [
    ["1. Sand", "2. Silt", "3. Clay", "Color", "Opacity", "Title"],
    [0, 0.5, 0.5, "palegreen", 0.1, "More than 50% silt"],
    [0.5, 0.5, 0],
    [0, 1, 0],
    [],
    [0.5, 0, 0.5, "moccasin", 0.4, "More than 50% sand"],
    [0.5, 0.5, 0],
    [1, 0, 0],
    [],
    [0, 0.5, 0.5, "coral", 0.3, "More than 50% clay"],
    [0.5, 0, 0.5],
    [0, 0, 1],
  ];
  loadDataToTables(pointsData, linesData, areasData);
};

// Check if there is something in localStorage
if (localStorage.getItem("pointsTable")) {
  const hereBeforeMessage = document.createElement("div");
  hereBeforeMessage.innerHTML = `
    <p>If you have found this site to be useful consider</p>
    <div class='donate-buttons'>
      <a class="donate" role="button" href="https://paypal.me/BlomJ" rel="noopener noreferrer" target="_blank">donating</a>
      <a class="bmc-button" rel="noopener" target="_blank" href="https://www.buymeacoffee.com/OfU1nAuiI">
        <img src="coffee.svg" alt="Buying me a coffee">
        <span style="margin-left:5px">Buy me a coffee</span>
      </a>
    </div>
    <hr>
    <p>
      <strong>Do you wan't to load your previously entered data into the tables?</strong>
    </p>
  `;

  const storagePrompt = swal({
    title: "You've been here before!",
    content: hereBeforeMessage,
    buttons: {
      sample: {
        text: "No, show example data",
        value: null,
        visible: true,
        className: "show-sample",
        closeModal: true,
      },
      empty: {
        text: "No, empty the tables",
        value: "empty",
        visible: true,
        className: "show-empty",
        closeModal: true,
      },
      load: {
        text: "Yes, load previous data",
        value: "ok",
        visible: true,
        className: "load-old",
        closeModal: true,
      },
    },
  });
  // Ask wether to load localStorage data or to load sample data
  storagePrompt.then((result) => {
    if (result === "ok") {
      const pointsData = JSON.parse(localStorage.getItem("pointsTable"));
      const linesData = JSON.parse(localStorage.getItem("linesTable"));
      const areasData = JSON.parse(localStorage.getItem("areasTable"));
      loadDataToTables(pointsData, linesData, areasData);
    } else if (result === "empty") {
      const pointsData = [pointsPlaceholder];
      const linesData = [linesPlaceholder];
      const areasData = [areasPlaceholder];
      loadDataToTables(pointsData, linesData, areasData);
    } else if (!result) {
      loadSampleData();
    }
  });
} else {
  // First time here so load sample data
  loadSampleData();
}

const timeOutTime = 375; //ms

Draw.setListeners();

/* function makeLegend() {
  console.group("gen Legend");
  const parsedPoints = Parse.Points(pointsTable.getData());
  // get title and marker/symbol
  const pointLegenditems = parsedPoints
    .filter(({ title }) => title)
    .map(({ title, shape }) => ({ title, shape: shape || "circle" })); // TODO default shape instead of circle

  const parsedLines = Parse.LinesAreas(linesTable.getData())
  const lineLegenditems = parsedLines
    .filter(({ title }) => title)
    .map(({ title, linestyle }) => ({ title, linestyle: linestyle || "none" })); // TODO default linestyle instead of none

  const parsedAreas = Parse.LinesAreas(areasTable.getData());
  const areaLegenditems = parsedAreas
    .filter(({ title }) => title)
    .map(({ title, color, opacity }) => ({ title, color: color || "black", opacity: opacity || 1 })); // TODO default color instead of black

  const legendItems = [...pointLegenditems, ...lineLegenditems, ...areaLegenditems];

  // !!SELECT EXISTING LEGEND IF ALREADY MAKELEGENDEDED
  const legend = d3.select("#ternary-plot").append("g")
    .attr("class", "legend")
    .attr("transform", "translate(5, 10)");

  console.log(legendItems)

  legend.append("text")
    .attr("text-decoration", "underline")
    .text("Legend");

  const legendSpacingY = 20;

  console.log(legendItems)

  legend.selectAll("text")
    .data(legendItems)
    .enter().append("text")
    .attr("transform", (_d, index) => {console.log(_d, index); return `translate(0,${(index + 1) * legendSpacingY})`})
    .text((d) => d.title)
    .attr("font-size", "1em");
} */

// const makeLegendButton = document.getElementById('makeLegend');
// makeLegendButton.addEventListener('click', () => makeLegend());

/*
const setListenerAction = (id) => (event) => (action) => {
  const element = document.getElementById(id)
  console.log(element)
  events.forEach((event, i) => element.addEventListener(event, (actions)()) )
}
*/

const clearPointsButton = document.getElementById("clearPoints");
clearPointsButton.addEventListener("click", () => clear(".point"));
clearPointsButton.addEventListener("mouseover", () => {
  d3.selectAll(".point").attr("opacity", "0.4");

  setTimeout(() => {
    d3.selectAll(".point").attr("opacity", "1");
  }, timeOutTime);
});

const clearLinesButton = document.getElementById("clearLines");
clearLinesButton.addEventListener("click", () => clear(".ternary-line"));
clearLinesButton.addEventListener("mouseover", () => {
  d3.selectAll(".ternary-line").attr("stroke-opacity", "0.3");

  setTimeout(() => {
    d3.selectAll(".ternary-line").attr("stroke-opacity", "1");
  }, timeOutTime);
});

const clearAreasButton = document.getElementById("clearAreas");
clearAreasButton.addEventListener("click", () => clear(".ternary-area"));
clearAreasButton.addEventListener("mouseover", () => {
  d3.selectAll(".ternary-area").attr("opacity", "0.1");

  setTimeout(() => {
    d3.selectAll(".ternary-area").attr("opacity", "1");
  }, timeOutTime);
});

const clearLabelsButtons = document.querySelectorAll(".clearLabels");
clearLabelsButtons.forEach((clearLabelsButton) => {
  clearLabelsButton.addEventListener("click", clearLabels);

  // Show linethrough vertex labels for short while when hovering over clear Labels button
  clearLabelsButton.addEventListener("mouseover", () => {
    d3.selectAll(".vertex-label").attr("text-decoration", "line-through");

    setTimeout(() => {
      d3.selectAll(".vertex-label").attr("text-decoration", "none");
    }, timeOutTime);
  });
});

const clearAllButton = document.getElementById("clearAll");
clearAllButton.addEventListener("click", clearAll);
clearAllButton.addEventListener("mouseover", () => {
  d3.selectAll(".ternary-line,.vertex-label,.ternary-area,.point")
    .attr("opacity", "0.3")
    .attr("text-decoration", "line-through")
    .attr("stroke-opacity", "0.3");

  setTimeout(() => {
    d3.selectAll(".ternary-line,.vertex-label,.ternary-area,.point")
      .attr("opacity", "1")
      .attr("text-decoration", "none")
      .attr("stroke-opacity", "1");
  }, timeOutTime);
});

function warnEmptyTable(tables, tableString) {
  const removeCheck = swal(
    `This will remove all values you have entered into ${tableString}`,
    "There's no going back once you click OK!",
    {
      buttons: ["Cancel", "OK, remove values"],
      icon: "warning",
    }
  );

  removeCheck.then((result) => {
    if (result) {
      tables.forEach((table) => {
        let dataToLoad;
        switch (table) {
          case pointsTable:
            dataToLoad = pointsPlaceholder;
            break;
          case linesTable:
            dataToLoad = linesPlaceholder;
            break;
          case areasTable:
            dataToLoad = areasPlaceholder;
            break;
          default:
            dataToLoad = [];
        }
        table.loadData([dataToLoad]);
      });
    }
  });
}

const clearAllTablesButton = document.getElementById("clearAllTables");
clearAllTablesButton.addEventListener("click", () => {
  warnEmptyTable([pointsTable, linesTable, areasTable], "all tables.");
});

const clearPointsTablesButton = document.getElementById("clearPointsTable");
clearPointsTablesButton.addEventListener("click", () => {
  warnEmptyTable([pointsTable], "the points table.");
});

const clearLinesTablesButton = document.getElementById("clearLinesTable");
clearLinesTablesButton.addEventListener("click", () => {
  warnEmptyTable([linesTable], "the lines table.");
});

const clearAreasTablesButton = document.getElementById("clearAreasTable");
clearAreasTablesButton.addEventListener("click", () => {
  warnEmptyTable([areasTable], "the areas table.");
});

const downloadDonatePrompt = () => {
  const donatePromptMessage = document.createElement("div");

  donatePromptMessage.innerHTML = `
  <p>Was it easy to make it? I hope so! I regularly improve this site to make sure it's easy to use, this takes up time and effort. So if this tool has saved you the frustration of having to work with
  shoddy Excel templates or other dingy software, then please <strong>donate</strong> or <strong>buy be me coffee</strong> to support development and keep this site ad-free.</p>
  <div class='donate-buttons'>
  <a class="donate" role="button" href="https://paypal.me/BlomJ" rel="noopener noreferrer" target="_blank">Donate</a>
  <a class="bmc-button" rel="noopener" target="_blank" href="https://www.buymeacoffee.com/OfU1nAuiI">
  <img src="coffee.svg" alt="Buying me a coffee">
  <span style="margin-left:5px">Buy me a coffee</span>
  </a>
  </div>
  <hr>
  `;

  const donatePrompt = swal({
    title: "Here's your ternary plot",
    content: donatePromptMessage,
    buttons: {
      cancel: {
        text: "No, thank you",
        value: null,
        visible: true,
        closeModal: true,
      },
    },
  });
};

const downloadSVGButton = document.getElementById("downloadSVG");
downloadSVGButton.addEventListener("click", () => {
  downloadSvg(document.querySelector("#ternary-plot"), "TernaryPlot.com", {
    css: "none",
  });

  downloadDonatePrompt();

  // if (process.env.NODE_ENV !== "production") {
  //   return;
  // }

  // Invoke the function by making a request.
  fetch(`/.netlify/functions/register-hit?format=svg`)
    .then((res) => res.json())
    .then((json) => {
      console.log(json);
    });
});

const downloadPNGButton = document.getElementById("downloadPNG");
downloadPNGButton.addEventListener("click", () => {
  downloadPng(document.querySelector("#ternary-plot"), "TernaryPlot.com", {
    css: "none",
  });

  downloadDonatePrompt();

  // if (process.env.NODE_ENV !== "production") {
  //   return;
  // }

  // Invoke the function by making a request.
  // Update the URL to match the format of your platform.
  fetch(`/.netlify/functions/register-hit?format=png`)
    .then((res) => res.json())
    .then((json) => console.log(json));
});
