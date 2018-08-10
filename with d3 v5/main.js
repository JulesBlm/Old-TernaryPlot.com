graticule = d3.ternary.graticule()
  .majorInterval(0.2)
  .minorInterval(0.05);

function resize(t) {
  t.fit(window.innerWidth,window.innerHeight);
};

var ternary = d3.ternary.plot()
  .call(resize)
  .call(d3.ternary.scalebars())
  .call(d3.ternary.vertexLabels(["Clay", "Sand", "Silt"]))
  .call(d3.ternary.neatline())
  .call(graticule);

d3.select('body').append("svg").call(ternary);

function gotData(d) {

  dataPoints = d3.entries(d).map( function(d) {
    v = d.value.map( function(c) { return [c.light, c.medium, c.heavy]; });
    return { type: d.key, value: v };
  });

  points = ternary.plot()
    .selectAll("circle")
    .data(dataPoints);

  ternary.plot()
    .selectAll('circle')
    .data(dataPoints)
    .enter().append('circle')
      .attr("r", 4)
      .each(function(d) {
        var plotCoords = ternary.point(d.value[0]); 
        return d3.select(this)
                .attr({cx: plotCoords[0], cy: plotCoords[1]});
      });

  // ternary.on("resize", drawPaths);
}


d3.json('data.json', gotData);

window.onresize = function(){
  resize(ternary);
};