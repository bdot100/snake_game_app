<!--
Guidance for AI coding agents working in this repository.

NOTE: At the time these instructions were generated the repository contained no source files. These instructions are intentionally procedural and discovery-first: verify the project layout (language, build files, tests) before making changes. If the repository owner intends you to scaffold or restore a project, ask for confirmation.
-->

# Copilot instructions — snake_game_app

Keep changes minimal and discovery-driven. If files are missing, ask the repository owner before creating large scaffolding.

1. Quick discovery checklist (run before coding)
   - Look for a language manifest at the repo root and act accordingly:
     - `package.json` → prefer `npm ci` then `npm test` / `npm start`.
     - `pyproject.toml` or `requirements.txt` → use `python -m venv .venv` and `pip install -r requirements.txt` / `pytest`.
     - `Cargo.toml`, `go.mod`, `pom.xml` → run the usual language-specific build/test commands.
   - Look for common game assets or structure: `assets/`, `src/`, `game/`, `README.md`.
   - If nothing is present (empty repo), do not scaffold without asking; provide a short plan and request permission.

2. Architecture and conventions (how to reason here)
   - Expect a small interactive app ("snake game") with a single-player game loop, an assets folder, and one main entrypoint (`src/index.*`, `main.py`, `app.js`, etc.).
   - Prefer minimal, single-responsibility changes: locate the game loop file and make localized edits (controls, collision, rendering) rather than reworking global architecture.
   - Tests (if present) are the source of truth for behavior. Run them before changing behavior.

3. Editing and PR guidance
   - Make small, testable commits. Each commit should have one clear purpose (e.g., "fix snake growth on eat", "add boundary wrap option").
   - If adding features, add or update a test that demonstrates the new behavior.
   - If adding assets, reference them from the manifest and keep sizes reasonable (prefer vector or small raster sprites).

4. Useful examples and patterns to look for
   - Main loop: search for `while`, `requestAnimationFrame`, or a `tick()`/`update()` function.
   - State: look for a `GameState` object or plain `state` dict/JS object holding `snake`, `food`, `direction`, `score`.
   - Collision: small utility functions like `collides(a,b)` or `isOutOfBounds(pos)` are common; prefer reusing them.

5. Integration / external dependencies
   - If a package manager file exists, prefer using the pinned dependency commands for installs.
   - If CI is configured (look for `.github/workflows/`), follow its lints/tests when adding code. Don't add CPU-heavy tasks to CI without discussing.

6. When things are ambiguous
   - Ask the repo owner one concise question rather than guessing (e.g., "Do you want me to scaffold a Python project layout?" or "Where is the game entrypoint?").
   - Provide a short plan and a single example change to confirm before proceeding with larger edits.

7. Examples of exact commands to try (discovery-first)
   - Node: `npm ci` then `npm test` or `npm run start` if `package.json` exists.
   - Python: create venv `python -m venv .venv`, `source .venv/bin/activate`, then `pip install -r requirements.txt` and `pytest`.

If you need me to scaffold a minimal playable snake app or populate this repo with starter code, say so and include your language preference.

---
Please review and tell me if you'd like more project-specific rules (coding style, CI commands, or preferred test runners).
