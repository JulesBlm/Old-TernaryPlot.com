pt.ternaryPlot = pt.ternaryPlot || {}

let ternary;

pt.ternaryPlot.init = function(graph) {
    console.log("init");

  graticule = d3.ternary.graticule()
    .majorInterval(0.2)
    .minorInterval(0.05);

  function resize(t) {
    t.fit(600, 600);
  };

  ternary = d3.ternary.plot()
    .call(resize)
    .call(d3.ternary.scalebars())
    .call(d3.ternary.neatline())
    .call(graticule);

  d3.select("svg").call(ternary);
    // On the side dynamic update of current composition of point
    // - Sand : 80%
    // - Silt : 10%
    // - Clay : 10%
    // move point around with mouse?
};

pt.ternaryPlot.addLabels = function(e) {
    console.log("addLabels1");
    ternary.call(d3.ternary.vertexLabels(e)); // transition??
};

pt.ternaryPlot.markAxes = function(lines) {
    
    let d = [0,0,1];

    const paths = ternary.plot()
      .selectAll(".line")
      .data(d);

    paths.enter().append('path')
      .attr("class", "ternary-line")
      .attr("d", function(line) {
        return ternary.path(line);
      });

  d3.selectAll(".axes")
    .transition() // First fade to green.
      .style("stroke-width", "10px")
    .transition() // Wait one second. Then brown, and remove.
      .delay(600)
      .style("fill", "2px")
      .remove();

};