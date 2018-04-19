pt.ternaryPlot = pt.ternaryPlot || {}

let ternary;

pt.ternaryPlot.init = function(graph) {
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
    // move point around with mouse?
};

pt.ternaryPlot.addLabels = function(e) {

  ternary.call(d3.ternary.vertexLabels(e)); // transition??
};

pt.ternaryPlot.addValueBox = function(e) {

  const keys = Object.keys(e);
  const values = Object.values(e);

  valueGroup = d3.select("svg").append("g")
      .attr("id", "valueGroup")
      .attr("transform", "translate(50,50)")
      .attr("width", 50)
      .attr("height", 75)

  // Enter append, update, exit cycle!!
  valueGroup
    .selectAll("text")
      .data(e).enter()
      .append("text")
        .text(function(d) { console.log("batsegeziech", d); })
        .attr("y", function(d, i) { 20 * i})

  valueGroup.append("text")
    .text(`${keys[0]}: 0`)

  valueGroup.append("text")
    .text(`${keys[1]}: 0`)
    .attr("y", 20)

  valueGroup.append("text")      
    .text(`${keys[2]}: 0`)
    .attr("y", 40)
} 

pt.ternaryPlot.updateValueBox = function(e) {
  console.log("update")
  console.log(valueGroup)
}

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