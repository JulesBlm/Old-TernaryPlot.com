function capitalize(word) {
  return word.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function resize(t) {
  if (window.innerWidth > 550) {
    t.fit(500, 500);
  } else {
    t.fit(window.innerWidth, window.innerHeight);
  }
}

function removeTrailingElements(line) {
  while (line[line.length - 1] === null || line[line.length - 1] === '') { // While the last element is a null or empty string
    line.pop(); // Remove that last element
  }
  return line;
}

function getDrawArray(line) {
  const drawArray = [];
  line.forEach((point) => {
    const [a, b, c] = Object.values(point);
    drawArray.push([a, c, b]); // d3.ternary wants the values swapped ¯\_(ツ)_/¯
  });
  return drawArray;
}

export { capitalize, resize, removeTrailingElements, getDrawArray };
