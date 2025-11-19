# Classic Snake (minimal)

This is a minimal client-side implementation of the classic Snake game. Open `index.html` in a browser to play.

Features

- Canvas-based grid rendering
- Arrow keys or WASD controls
- Pause/Resume (P or Pause button)
- Restart (R or Restart button)
- Optional wrap-around toggle

How to run

1. Open `index.html` in your browser (double-click or serve from a static file server).

Optional (static server)

```zsh
# macOS / Python 3
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

Files

- `index.html` — page and canvas
- `styles.css` — lightweight styling
- `src/game.js` — game logic

If you'd like a packaged version (npm, bundler) or tests added (Jest/Playwright), tell me which you prefer and I can add them.

---

## About this project

Classic Snake is a small, browser-based demonstration of a discrete, grid-based game loop. It's intentionally minimal and keeps the game logic in `src/game.js` so the core mechanics are easy to read and modify. The implementation includes:

- Deterministic, tick-based movement (setInterval) for predictable updates.
- Direction buffering (prevents 180° reversal) and simple collision detection.
- Random food spawning on empty cells and gradual speed increase as score grows.
- Optional wrap-around mode and a persistent high score stored in `localStorage`.

This repository is intended as a learning and demonstration project — a compact example you can extend (mobile controls, AI, power-ups, multiplayer, etc.).

## Run locally

Open `index.html` directly in a browser, or serve the directory with a simple static server:

```zsh
# macOS / Python 3
python3 -m http.server 8000
# then open http://localhost:8000 in your browser
```

## Files and structure

- `index.html` — minimal page and HUD
- `styles.css` — visual styling and animations (including high-score blink)
- `src/game.js` — game logic, rendering and input handling

## Developer

- Name: Bidemi Okunade
- Email: [bidemiokunade@gmail.com](mailto:bidemiokunade@gmail.com)
- GitHub: [bdot100](https://github.com/bdot100)
- LinkedIn: [Bidemi Okunade](https://www.linkedin.com/in/bidemi-okunade-415a38241)
- Expertise: Flutter, Dart, PHP (Laravel, Symfony), Python (Django)

This project was developed with assistance from GitHub Copilot to speed up prototyping and implementation.

If you'd like me to add tests, package.json, or a simple npm-based dev server (with live reload), I can add those next.
