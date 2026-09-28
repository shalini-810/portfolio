# shalini.sec portfolio

Plain HTML, CSS and JavaScript. No frameworks or build step.

## Folder layout (keep it exactly like this)
```
index.html
styles.css
main.js
shield.js
projects.js
achievements.js
assets/images/profile.jpg   (optional — not currently used, see "Hero visual")
assets/resume.pdf       (optional, powers the "Download Resume" button)
```

## Run locally
Open `index.html`, or run `python3 -m http.server` in this folder (the Live Server extension also works). Deploy by pushing the folder contents to your GitHub Pages repo.

## Content
- **Hero visual:** the hero's right-hand column is an **access-control shield** - a faceted, straight-edged panel with a keyhole punched clean through it, its face a wireframe mesh stretched over a field of streaming `0`s and `1`s. Defence made of data, with one hole that only a key opens. Bright signals run along the mesh edges and a light burns at the point. A faint node network drifts across the whole page behind it.
  - Everything is drawn on two `<canvas>` elements (`#shield` in the hero, `#net` fixed behind the page) by `shield.js`. The outline, the keyhole, the mesh and the binary are all canvas geometry, so there is no SVG to keep in sync and no DOM churn per frame.
  - **The keyhole is a real hole, not a dark shape drawn on top.** The binary is drawn inside `ctx.clip(maskPath, 'evenodd')`, where `maskPath` is the shield plus the keyhole, so no bit is ever drawn in the opening. The keyhole is one continuous outline (up the left join, over the arc, down the right) rather than two subpaths - two of them would leave a hairline gap and a sliver where the even-odd rule counts a point inside the hole as inside the panel.
  - To remove it, delete `shield.js`, its `<script>` tag, the `.shield` block and the `#net` canvas in `index.html`, and the `.shield*` / `#net` rules in `styles.css`.
  - To bring back the portrait instead, `assets/images/profile.jpg` is still in the folder and the matching `.photo` rules are still in `styles.css` (marked UNUSED): add the `<figure class="photo">` back into the hero grid.
  - **The mesh is generated once, at load.** Boundary vertices plus a jittered 30-unit grid, filtered by `isPointInPath` against the shield-minus-keyhole mask, then every node linked to its 3 nearest neighbours as long as the line between them never leaves the panel - that is what stops the mesh drawing across the keyhole. Tune `GRID` (point density), `K` (links per node) and `MAXD` (link length).
  - **Only the moving parts are redrawn.** The wireframe and the glowing rims never change, so they are painted into an offscreen canvas at device resolution and blitted; a frame costs one `drawImage` plus the binary, the nodes, the signals and the tip. The binary's flicker rides on `globalAlpha` with two fixed `fillStyle`s - building an `rgba()` string per bit means ~1000 colour parses a frame and measured more expensive than the glyphs themselves.
  - The mesh nodes carry the outline: rim nodes are bigger and brighter than interior ones, so the shape stays readable underneath the field.
  - The scroll is seamless by construction: each column starts at its own random offset and speed, so the field never moves as one block.
  - The accent colour is read from `--g` in `styles.css` (falling back to `#71ff00`), so the canvas and the rest of the page cannot drift apart.
  - Degradation, in order of how much you lose. `prefers-reduced-motion` gets **one drawn frame and no loop** - the panel is the content, the movement is not, so the panel should still be there without it. (Note that assigning `canvas.width` wipes the canvas, so `resize()` repaints a still panel itself.) With JavaScript off entirely the caption stays and the canvases are blank - there is no fallback drawing, because the panel *is* the script. The loop pauses when the hero scrolls away (IntersectionObserver) or the tab is hidden; the network only checks the tab. Below `768px` the shield is hidden, `scale` stays 0 and the loop never starts, so phones pay nothing.
  - The hero grid does not split into two columns until `1120px`, which is the first viewport where each column is wide enough (514px). Below that the shield centres under the text rather than being squeezed.
- **Projects:** edit `projects.js`. The page order matches the array order. Each project has `title`, `status`, `cats` (`cybersecurity | networking | web`), `summary`, `tags`, `repo`, `demo` and `image`. An empty `repo`/`demo`/`image` hides the button or shows the placeholder. Set `draft: true` to hide a project.
  - **Project screenshots:** put them in `assets/images/projects/` (landscape, about 16:10) and point `image` at the file, e.g. `image: 'assets/images/projects/decepnet.jpg'`. A path that does not resolve yet stays invisible over the placeholder, so nothing breaks while you are still collecting them.
- **Timeline:** edit it in `index.html` when you have dates.
  - **Competitions & achievements:** edit `achievements.js`. The page order matches the array order. Each entry has `cats` (`hackathons | certifications | others` — required, it drives the filter), `title`, `year`, `type`, `result`, `participants`, `duration`, `team`, `role`, `built`, `technologies`, `mainImage`, `certificateImage`, `achievementImage` and `experience`. Add one object and the card is generated for you. Set `draft: true` to hide an entry.
  - The **card** is a short summary: title, result, event type, role, tech and at most one photo — a recruiter never has to click to learn what you achieved. **"View Experience"** opens a dialog with the full write-up and every photo.
  - `year`, `participants`, `duration`, `team`, `role`, `built`, `technologies` and the images may be left empty; those parts are simply not rendered.
  - **Photo slots:** `photos` controls which slots the entry may use. Leave it out for all three, set `photos: false` for none at all (most certifications), or list the keys you actually use. **A slot only appears once its path is filled in** — an empty path renders nothing, so a card never reserves an empty box. The card shows the first photo only; the dialog shows them all.
  - Card height follows its own content, so a photo-heavy hackathon never stretches the grid and a short certification sits at its natural height.
  - To reserve a slot, copy the `soon: true` block: it renders a slim full-width dashed note below the cards, with no empty card and no photo placeholders.
  - The filter buttons in `index.html` (Hackathons / Certifications / Others) match the `cats` values. This bar has no "All" button: everything shows on load, and clicking the active filter again clears it back to everything. A category with no entries shows a short "nothing here yet" note. The projects bar keeps its own "All" button.
- **Event photos:** put them in `assets/images/achievements/` and point the fields at them, e.g. `mainImage: 'assets/images/achievements/omnikon-event.jpg'`. A slot you have not filled in simply does not render, so nothing breaks and no empty box is reserved. Clicking a photo opens it in a full-size lightbox.
- **Resume:** place `assets/resume.pdf`; the hero button downloads it.

## Contact form
The form is static: submitting it opens the visitor's email app with the message pre-filled (`mailto:`), so no backend is required. The address lives in `main.js`.

## Background effect
The full-page Vanta field loads only after the page is ready, and is skipped for reduced motion, data saver and low-power devices. It is intentionally kept subtle: tune `points`/`spacing` in `main.js`, or raise the `.veil` opacity in `styles.css`.

The full-page Vanta field is the only thing that needs Three.js, and it loads once, after the page is ready. The hero's canvas shield does not use it.