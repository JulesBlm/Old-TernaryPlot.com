/* Change to v5 

Axes

Draw() > plot.rule > t.paths

Should every function 'return' something like in the old v3 version
*/
hatang = 0;

(function() {
  const path = void 0; // ?????

  d3.ternary = {};

  const cos30 = Math.sqrt(3) / 2;

  const tickValues = [.2, .4, .6, .8]

  const randomid = function() {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    for (i = j = 0; j <= 3; i = ++j) {
      const pos = Math.floor(Math.random() * possible.length);
      text += possible.charAt(pos);
    }
    return text;
  };

  const line = function() {
    return path = d3.line()
                    .x(d => { return d[0]; })
                    .y(d => { return d[1]; })
  };

  const angles = [0, 120, 240];

  /* ----- Graticules ----- */
  d3.ternary.graticule = function() {

    let majorInterval = 0.1; // Stepsize for lines
    let minorInterval = null;

    majorTicks = function() {
      const ticks = [];
      const int = majorInterval;
      let start = int;

      // Nothing like range() in JS?

      while (start < 1) {
        ticks.push(start);
        start += int;
      }

      return ticks;
    };

    minorTicks = function() {
      const ticks = [];
      if (minorInterval == null) return ticks;
    
      const start = minorInterval;
      while (start < 1) {
        if (start % majorInterval !== 0) { ticks.push(start); }
        start += minorInterval;
      }

      return ticks;
    };

    graticule = function(plot) {

      const gratAxes = [0, 1, 2].map(function() { return d3.axisBottom().ticks(majorTicks()); });


      console.log("gratAxes", gratAxes);
      /* v5 ---
      d3.select(".axis")
        .call(d3.axisBottom(x));
      */

      axisGraticule = function(axis, i) {
        const container = d3.select(this);

        console.log(container);

        const minorTicksSelection = container.selectAll("path.minor").data(minorTicks());
        
        minorTicksSelection.enter().append("path")
            .attr("class", "minor")
            // .merge(minorTicksSelection); // ??

        const majorTicksSelection = container.selectAll("path.major").data(majorTicks());
        
        majorTicksSelection.enter().append("path")
          .attr("class", "major")
          // .merge(majorTicksSelection); // ??

        draw = function() {
          // plot.scales[i] is function that scales the axis
          axis.scale(plot.scales[i]);
          minorTicksSelection
            .attr("d", function(d) { console.log(plot.rule(i)); return plot.rule(i); }) 

          return majorTicksSelection.attr("d", function(d) { console.log(plot.rule(i)); return plot.rule(i); })

        };
        // plot.on("resize." + (randomid()), draw);
        
        return draw();
      };
      
      const doIt = plot.axes().selectAll(".graticule") //returns object (not array) in v4&5
          .data(gratAxes)
          .enter().append("g")
            .attr("class", "graticule")
            .attr("clip-path", "url(#axesClip)")
      
      doIt.each(function(d) { axisGraticule });

      return doIt.each(function(d) { axisGraticule });
    };
    
    graticule.axes = function() {
      return gratAxes;
    };

    graticule.majorInterval = function(d) {
      if (!d) return majorInterval;
      majorInterval = d;
      return graticule;
    };

    graticule.minorInterval = function(d) {
      if (!d) return minorInterval;
      minorInterval = d;
      return graticule;
    };

    return graticule;
  };

  /* ----- Scalebars ----- */
  d3.ternary.scalebars = function(opts) {    
    if (opts == null) opts = {};

    // console.log("Calling scalebar");
    let plot = null;
    const labels = opts.labels || null;

    const axes = [0, 1, 2].map(i => {
      return d3.axisTop()
              .ticks(10, "%")
              .tickValues(tickValues);
    });

    const adjustText = function(d, i) {
      if (i !== 2) return;
    
      return d3.select(this).selectAll("text")
              .attr("transform", function(d) {
                  const y = d3.select(this).attr("y");
                  return "translate(0 " + (-y) + ") rotate(-180 0 " + (2 * y) + ")";
              });
    };

    const formatLabel = function(d, i) {
      let width = plot.width();
      let dy = -30;
      let t = "translate(" + (width / 2) + ")";
      if (i === 2) {
        dy = 42;
        t = " rotate(-180 0 0) translate(" + (-width / 2) + ")";
      }
      return d3.select(this)
        .attr("class", "label")
        .attr("transform", t)
        .attr("y", dy)
        .attr("text-anchor", "middle")
        .text(d);
    };

    // console.info("formatLabel", formatLabel);

    const scalebar = function(p) {
      // console.log("Adding scalebar to plot");
      plot = p;
      const b_axes = plot.axes()
                .selectAll(".bary-axis")
                .data(angles)
                .enter().append("g")
                  .attr("class", function(d, i) {
                    let axisClass = "bary-axis";
                    if (i === 2) axisClass += " bottom";
        
                    return d;
                  });

      b_axes.each(function() {
        return d3.select(this)
                .append("text")
                .attr("class", "label");
      });

      const draw = function() {
        var labelSel; //var??

        axes.forEach((axis, i) => {
          const s = plot.scales[i].copy();

          return axis.scale(s);
        });

        const r = plot.radius();
        const offs = plot.center();

        b_axes.each(function(d, i) {
          const axisGroup = d3.select(this);

          return axes[i](axisGroup);
        }).attr("transform", (d, i) => {
            const x = offs[0];
            const y = offs[1];

            return "rotate(" + (-60 + i * 120) + " " + x + " " + y + ") translate(0 " + (r / 2) + ")";
          })
        .each(adjustText);

        if (labelSel) return labelSel = plot.axes().selectAll(".bary-axis .label").data(labels).each(formatLabel);
      };
      plot.on("resize." + randomid(), draw);
      return draw();
    };

    scalebar.labels = function(l) {
      if (l == null) return labels;

      labels = l;
      return scalebar;
    };

    scalebar.axes = axes;
    return scalebar;
  };

  /* ----- Vertex labels ----- */
  d3.ternary.vertexLabels = function(labels) {
    let selected = null;
    const rotate = [0, 60, -60];
    const padding = 20;

    const L = function(plot) {
      let verts = plot.vertices(padding);
      let data = labels.map(function(l, i) { return { label: l, vertex: verts[i] }; });

      // Join data to axes
      selected = plot.axes()
                  .selectAll(".vertex-label")
                  .data(data);

        // console.log("selected", selected);

        draw = function() {
          selected.enter().append("text")
            .text(function(d) { return d.label })
            .attr("dy", ".35em")
            .attr("text-anchor", "middle")
            .attr("class", "vertex-label")
            .attr("transform", function(d, i) {
                  const ref = d.vertex, x = ref[0], y = ref[1];
                  return "translate(" + x + "," + y + ")rotate(" + rotate[i] + ")";
          });
        };

        plot.on("resize." + (randomid()), draw);
        draw();
      return selected;
    };

    return L;
  };

  /* ----- Neatline ----- */
  d3.ternary.neatline = function() {
    const neatline = function(plot) {
      let el; //??
      return el = plot.node().append("use")
              .attr("class", "neatline")
              .attr("xlink:href", "#bounds");
    };
    return neatline;
  };

  /* The triangle bounds */
  const _plotBounds = function(plot) {

    const domains = plot.scales.map(function(s) { return s.domain(); });

    // console.log("domains", domains);
    const points = [];
    for (i = j = 0; j <= 2; i = ++j) {
      let v = i - 1;

      if (v === -1) { v = 2; }

      let a = domains.map(function(d) { return d[0]; });


      a[v] = domains[v][1];
      points.push(a);
      a = domains.map(function(d) { return d[0]; });
      a[i] = domains[i][1];
      points.push(a);
    }

    const _ = d3.select(this);
    var el = _.select("#bounds");
    
    if (el.node() == null) el = _.append("polygon");

    el.datum(points).attr("id", "bounds");

    const draw = function() {
      return el
          .attr("points", d => {
            const di = d.map(c => {
              const svgCoordinate = plot.rawPoint(c);
              return svgCoordinate.join(",");
            });
            return di.join(" ");
          });
    };

    plot.on("resize." + (randomid()), draw);
    return draw();
  };

  d3.ternary.plot = function() {    
    // Dimensions
    let outerWidth = 500;
    let outerHeight = 500;
    let margin = {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    };
    let radius = null;
    let height = null;
    let width = null;
    
    let svg = null;
    let axes = null;
    let plot = null;
    let defs = null;
    const shouldClip = false;
    const callOnCreate = [];
    
    const scales = [0, 1, 2].map(function() {
      return d3.scaleLinear()
              .domain([0, 1])
              .range([0, 1]);
    });

    const events = d3.dispatch("resize");

    const innerWidth = function(w) {
      return w - margin.left - margin.right;
    };

    const innerHeight = function(h) {
      return h - margin.top - margin.bottom;
    };

    const rescaleView = function() {
      if (width == null) {
        width = innerWidth(outerWidth);
      }
      if (height == null) {
        height = innerHeight(outerHeight);
      }
      if (radius == null) {
        radius = width / Math.sqrt(3);
      }
      const center = [width / 2, radius];
      
      if (svg == null) return;

      svg
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("width", width)
        .attr("height", height);

      d3.select(svg.node().parentElement)
        .attr("width", outerWidth)
        .attr("height", outerHeight);

      for (let j = 0, len = scales.length; j < len; j++) {
        const s = scales[j];
        s.range([0, width]);
      }
      _plotBounds.call(defs.node(), T);

      if (shouldClip) plot.attr("clip-path", "url(#axesClip)");
      // return events.resize();
    };
    

    T = function(el) {

      svg = el.append("g");
      defs = svg.append("defs");
      axes = svg.append("g").attr("id", "axes");
      plot = svg.append("g").attr("id", "plot");

      rescaleView();

      defs.append("clipPath")
        .attr("id", "axesClip")
        .append("use")
          .attr("xlink:href", "#bounds");
      // console.log("Calling plot functions");

      // callOnCreate is Array of 5 function to perform(create)
      if (callOnCreate) callOnCreate.forEach(f => { return f(T); }); 
      
      return callOnCreate.length = 0

    };

    T.on = function(n, f) {
      return events.on(n, f);
    };

    T.fit = function(w, h) {
      r = 0;

      if (arguments.length === 2) {
        const nw = innerWidth(w);
        const nh = innerHeight(h);
        if (nh <= cos30 * nw) {
          r = nh * 2 / 3;
        } else {
          r = nw / Math.sqrt(3);
        }
      } else {
        r = nw / Math.sqrt(3);
      }
      T.radius(r);
      return T;
    };

    T.node = function() {
      return svg;
    };

    T.axes = function() {
      return axes;
    };

    T.plot = function() {
      return plot;
    };

    T.call = function(f) {
      if (svg != null) {
        f(T);
      } else {
        callOnCreate.push(f);
      }
      return T;
    };

    T.scales = scales;

    T.margin = function(m) {
      if (m == null) return margin;
      
      if (m.left != null) {
        margin = m;
      } else {
        margin = {
          left: m,
          right: m,
          top: m,
          bottom: m
        };
      }
      rescaleView();
      return T;
    };

    T.point = function(coords) {
      let sum = d3.sum(coords);
      if (sum !== 0) { coords = coords.map(d => { return d / sum; }); };

      return T.rawPoint(coords);
    };

    // Calculates SVG coordinates from Barycentric coordinates
    T.rawPoint = function(d) {

      if (d3.sum(d) === 0) return [0, 0];

      const A = scales[0], B = scales[1]; //, C = scales[2];
      const a = d[0], b = d[1], c = d[2];
      
      // Third point follows form first two  ¯\_(ツ)_/¯
      const x = A(a) / 2 + B(b);
      const y = B((1 - a) * cos30);

      return [x, y];
    };

    // Calculates ternary values/Barycentric coordinatas from SVG (Cartesian) coordinates
    T.value = function(arg) {
      // Cartesion coordinates
      const x = arg[0];
      const y = arg[1];

      const A = scales[0], B = scales[1]; //, C = scales[2];
      
      // Calculate and return ternary/barycentric values
      let a = 1 - B.invert(y) / cos30;
      let b = B.invert(x - A(a) / 2);
      let c = 1 - a - b;

      return [a, b, c];
    };

    positions = 0;

    T.path = (function(_this) {

      console.log("t.path _this", _this);

      return function(coordsList, accessor, interpolator) {
        console.log(coordsList, accessor, interpolator);

        line();

        if (!accessor) { accessor = function(d) { return d; } }
        
        positions = coordsList.map(function(d) { return T.point(accessor(d)); });
        
        console.log("positions", positions);
        console.log("path(positions", path(positions));

        return path(positions) + "Z";
      };
      (coordsList, accessor)
    })(this);

    T.rule = function(axis) {

      return function(value) {
        console.log("T.rule value", value);

        const ends = [];

        if (axis === 0) {        // First axis 
          ends = [[0, 1 - value, value], [1 - value, 0, value]];
        } else if (axis === 1) {  // Second axis
          ends = [[0, value, 1 - value], [1 - value, value, 0]];
        } else if (axis === 2) {  // Third axis
          ends = [[value, 0, 1 - value], [value, 1 - value, 0]];
        }

        console.log("ends", ends);
        console.log("T.path(ends)", T.path(ends));

        return T.path(ends);
      };
    };

    T.vertices = function(padding) {
      if (padding == null) padding = 0;

      const rotate = [0, -120, 120];
      return rotate.map(function(d) {
        let angle = d * Math.PI / 180;
        let x = width / 2 + Math.sin(angle) * (radius + padding);
        let y = radius - Math.cos(angle) * (radius + padding);
        return [x, y];
      });
    };

    T.range = function(range) {
      return T;
    };

    T.radius = function(r) {
      if (r != null) {
        radius = r;
        height = r * 3 / 2;
        width = r * Math.sqrt(3);
        outerHeight = height + margin.top + margin.bottom;
        outerWidth = width + margin.left + margin.right;
        rescaleView();
      } else {
        return radius;
      }
      return T;
    };

    T.center = function() {
      return [width / 2, radius];
    };

    T.height = function() {
      return height;
    };

    T.width = function() {
      return width;
    };

    T.clip = function(c) {
      if (c == null) return shouldClip;

      shouldClip = c;
      
      return T;
    };
    return T;
  };

}).call(this);

console.log(d3.ternary);