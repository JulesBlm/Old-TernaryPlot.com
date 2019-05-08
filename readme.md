# Ternary plot maker

The source code for my side project: [TernaryPlot.com](http://www.ternaryplot.com). A single purpose website to quickly and freely generate ternary plots. A ternary plot is a somewhat obscure diagram often used in geology, soil sciences, metallurgy, biolody and chemical engineering. The quickest option available for makint ternary plots was with Excel templates, which in my opinion are inflexible and produce ugly plots. Some R and Python libraries exist for this purpose but these are harder to use and require installing R and Python (of course). That's why I made a tool for personal use, and later decided to develop into something slicker and with more options.

Feel free to contact me if you have any questions or comments. Pull requests are

## To-do

1. Decrease bundle size
    * use hot-builder to build lightweigh HandsOnTable package
    * Update d3-ternary to d3 v5 and import only necessary modules
2. Use HandsOnTable validators
3. Show warning when top row is not right
4. Show if labels are added
6. Don't make top row of numeric columns numeric type
7. Better CSS, allow tables to become wider on very wide screens
9. Don't use ID so many times to select buttons for eventlisteners.
11. Use [d3 selection raise](https://github.com/d3/d3-selection#selection_raise) to bring points in front of areas on hover
12. Lock columns titles and use columns properties in HandsOnTable
13. Bring drawn points to front if areas are plotted over them https://codepen.io/osublake/pen/YXoEQe 
15. Clean explain page code
16. Make option to add rows


## Libraries used

* Daven Quinn's [D3-ternary](https://github.com/davenquinn/d3-ternary)
* [D3 v3](https://d3js.org/)
* [SVG Crowbar](https://github.com/NYTimes/svg-crowbar)
* [Sweet Alert](https://sweetalert.js.org/)
* [HandsOnTable](https://handsontable.com/)
