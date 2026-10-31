# Website typography

The public pages use Noto Sans JP, with a variable weight axis (100–900).
Body: 400; supporting headings and controls: 500; primary headings: 700.
The license is `OFL-noto-sans-jp.txt`.

`typography.css` defines disjoint Unicode ranges:
- `noto-sans-jp-site.woff`: 916 characters used in the current HTML and JavaScript, plus Latin characters. 275,656 bytes.
- `noto-sans-jp-full.woff`: the remaining characters in the original full font, downloaded only if needed. New page text continues to work without regenerating the subset.

The subset was generated from the existing full font using fontTools.subset, retaining the variable weight axis. Neither a third-party font service nor separate per-weight downloads are required. `font-display: swap` preserves readable fallback text while loading.

The historical `nge-sans.woff` and `nge-serif.woff` are retained for archived copies, but are no longer referenced by the active website.
