function(classname, prop ,decoration) {
  d3.selectAll(classname)
    .attr(prop, decoration);

  setTimeout(function() {
    d3.selectAll(classname)
      .attr(prop, "none");
  }, 700);
  