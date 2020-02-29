# TernaryPlot.com

The source code for my side project: [TernaryPlot.com](http://www.ternaryplot.com). A single purpose website to quickly and freely generate ternary plots. A ternary plot is a somewhat obscure diagram often used in geology, soil sciences, metallurgy, biology and chemical engineering. The quickest option available for makint ternary plots was with Excel templates, which in my opinion are inflexible and produce ugly plots. Some R and Python libraries exist for this purpose but these are harder to use and require installing R and Python (of course). That's why I made a tool for personal use, and later decided to develop into something slicker and with more options.

Feel free to contact me if you have any questions or comments. Pull requests are very welcome!

## To Do

0. Download SVG button does not work for everyone apparantly
4. Better example data
2. Templates for common Ternary Plots
1. Button to generate legend from point, lines, areas, that have a title
1. Decrease bundle size
    * Split bundle
    * Lazy loading
    * Update d3!
2. Rewrite d3-ternary to d3 v5 and import only necessary d3 modules
2. Use HandsOnTable validators to validate input
3. Title texts for points and lines
3. Show warning when top row is not entered correctly
7. Better CSS, allow tables to become wider on very wide screens
8. Write tests
10. Accessibility!
11. Use [d3 selection raise](https://github.com/d3/d3-selection#selection_raise) to bring points in front of areas on hover or bring drawn points to front if areas are plotted over them [like this](https://codepen.io/osublake/pen/YXoEQe)
9. Don't use ID so many times to select buttons for eventlisteners.
16. Make option to add rows

## Someday

1. Write my own (clean and idiomatic) d3-ternary-plot d3 plugin
1. Rewrite with ReactJS and Tailwind CSS
1. Clean explain page code, maybe use MDX-slide?
1. Add a slider like [this Observable](https://observablehq.com/@yurivish/ternary-slider), and add said slider to explanation page


## Libraries used

* Daven Quinn's [D3-ternary](https://github.com/davenquinn/d3-ternary)
* [D3 v3](https://d3js.org/)
* [SVG Crowbar](https://github.com/NYTimes/svg-crowbar)
* [Sweet Alert](https://sweetalert.js.org/)
* [HandsOnTable](https://handsontable.com/)
