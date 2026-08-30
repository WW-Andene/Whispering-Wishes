# app/assets

`icon.png` is a same-content copy of `Abby_icon.png`, kept only because
`npm run icons` (`@capacitor/assets generate --android`) requires that exact
filename as its source — the tool has no option to point at a differently-named
file. If `Abby_icon.png` changes, re-copy it over `icon.png` before running
`npm run icons`.
