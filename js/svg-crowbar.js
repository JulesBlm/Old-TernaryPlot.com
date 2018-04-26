(function() {
  const doctype = `<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">`;

  window.URL = (window.URL || window.webkitURL);

  const body = document.body;

  const prefix = {
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg"
  };

  initialize();

  function initialize() {
    const documents = [window.document],
        iframes = document.querySelectorAll("iframe"),
        objects = document.querySelectorAll("object");    
    let SVGSources = [];

    // add empty svg element
    const emptySvg = window.document.createElementNS(prefix.svg, "svg");
    window.document.body.appendChild(emptySvg);
    const emptySvgDeclarationComputed = getComputedStyle(emptySvg);

    [].forEach.call(iframes, function(el) {
      try {
        if (el.contentDocument) {
          documents.push(el.contentDocument);
        }
      } catch(err) {
        console.log(err);
      }
    });

    [].forEach.call(objects, function(el) {
      try {
        if (el.contentDocument) {
          documents.push(el.contentDocument);
        }
      } catch(err) {
        console.log(err)
      }
    });

    documents.forEach(function(doc) {
      const newSources = getSources(doc, emptySvgDeclarationComputed);
      // because of prototype on NYT pages
      for (let i = 0; i < newSources.length; i++) {
        SVGSources.push(newSources[i]);
      }
    });
    if (SVGSources.length > 0) {
      download(SVGSources[0]);
    } else {
      console.log(SVGSources);
      swal("Couldn’t find any SVG nodes.");
    }

  }

  function getSources(doc, emptySvgDeclarationComputed) {
    const svgInfo = [],
        svg = doc.querySelector("svg"); //svgs = doc.querySelectorAll("svg");

    // [].forEach.call(svgs, function (svg) {

      svg.setAttribute("version", "1.1");

      // removing attributes so they aren"t doubled up
      svg.removeAttribute("xmlns");
      svg.removeAttribute("xlink");

      // These are needed for the svg
      if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
        svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
      }

      if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
        svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
      }

      setInlineStyles(svg, emptySvgDeclarationComputed);

      const source = (new XMLSerializer()).serializeToString(svg);
      const rect = svg.getBoundingClientRect();
      svgInfo.push({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        class: svg.getAttribute("class"),
        id: svg.getAttribute("id"),
        name: svg.getAttribute("name"),
        childElementCount: svg.childElementCount,
        source: [doctype + source]
      });
    // });
    return svgInfo;
  }

  function download(source) {
    let filename = "untitled";

    if (source.name) {
      filename = source.name;
    } else if (source.id) {
      filename = source.id;
    } else if (source.class) {
      filename = source.class;
    } else if (window.document.title) {
      filename = window.document.title.replace(/[^a-z0-9]/gi, "-").toLowerCase();
    }

    const url = window.URL.createObjectURL(new Blob(source.source, { "type" : "text\/xml" }));

    const a = document.createElement("a");
    body.appendChild(a);
    a.setAttribute("class", "svg-crowbar");
    a.setAttribute("download", filename + ".svg");
    a.setAttribute("href", url);
    a.style["display"] = "none";
    a.click();

    setTimeout(function() {
      window.URL.revokeObjectURL(url);
    }, 10);
  }

  function setInlineStyles(svg, emptySvgDeclarationComputed) {

    function explicitlySetStyle (element) {
      const cSSStyleDeclarationComputed = getComputedStyle(element);

      let len;
      let computedStyleStr = "";
      for (let i = 0, len = cSSStyleDeclarationComputed.length; i < len; i++) {
        const key = cSSStyleDeclarationComputed[i];
        const value = cSSStyleDeclarationComputed.getPropertyValue(key);
        if (value !== emptySvgDeclarationComputed.getPropertyValue(key)) {
          computedStyleStr+=key+":"+value+";";
        }
      }
      element.setAttribute("style", computedStyleStr);
    }
    function traverse(obj){
      const tree = [];
      tree.push(obj);
      visit(obj);
      function visit(node) {
        if (node && node.hasChildNodes()) {
          let child = node.firstChild;
          while (child) {
            if (child.nodeType === 1 && child.nodeName != "SCRIPT"){
              tree.push(child);
              visit(child);
            }
            child = child.nextSibling;
          }
        }
      }
      return tree;
    }
    // hardcode computed css styles inside svg
    const allElements = traverse(svg);
    let i = allElements.length;
    while (i--){
      explicitlySetStyle(allElements[i]);
    }
  }


})();