function capitalize(word) {
  return word.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase());
}

function resize(t) {
  if (window.innerWidth > 550) {
    t.fit(500, 500);
  } else {
    t.fit(window.innerWidth, window.innerHeight);
  }
}

export { capitalize, resize };
