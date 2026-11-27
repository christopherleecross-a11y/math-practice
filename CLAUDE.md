# Notes for Claude

- When you change the practice site or the crossword page in a way a teacher would notice, add a line at the TOP of
  `WHATS_NEW` in practice.html (date, plain-language text, and `subjects` if it only matters for some subjects).
  Teachers see new lines in the "What's new" box on their Teacher tools page.
- If the change affects how a teacher does something, update the matching section of `helpScreen()` too.
- The lesson plans live in `lessons.js` (loaded only when needed; see `lessonsReady()` in practice.html). After changing
  lessons.js, run `python3 walks/lessons-split.py` so practice.html's lesson index and `LESSONS_VER` (cache-busting) match.
- The interactives live in `interactives.js` (loaded only when one is shown; see `ixReady()` in practice.html). After changing
  interactives.js, run `python3 walks/ix-split.py` so practice.html's interactive index and `IX_VER` match.
- Before pushing, run `python3 tests/site-check.py`. GitHub runs the same checks on every push and publishes the site only if
  they pass (.github/workflows/check-and-publish.yml).
