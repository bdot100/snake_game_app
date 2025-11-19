/*
  src/game.js

  Minimal classic Snake game implementation (client-side).

  This file intentionally keeps logic simple and synchronous for clarity:
  - Discrete grid-based movement (no physics)
  - Fixed-timestep tick (setInterval) for deterministic moves
  - Snake stored as an array of {x,y} with snake[0] being the head

  The comments below explain the main data shapes and the purpose of each function.
*/

(function(){
  // DOM references: canvas and small HUD controls
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const scoreEl = document.getElementById('score');
  const statusEl = document.getElementById('status');
  const highscoreEl = document.getElementById('highscore');
  const btnPause = document.getElementById('btn-pause');
  const btnRestart = document.getElementById('btn-restart');
  const wrapCheckbox = document.getElementById('wrap');

  // Logical grid size (number of cells per row/col). Change this to make the grid coarser/finer.
  const GRID_SIZE = 20; // cells per row/column
  // CELL is the pixel size of a single cell in CSS pixels (clientWidth).
  // We compute it from `canvas.clientWidth` so coordinates used for drawing match
  // the transform used for devicePixelRatio scaling. Recompute on resize.
  let CELL = Math.floor(canvas.clientWidth / GRID_SIZE);

  // Game state variables
  // snake: array of {x,y} positions, snake[0] is the head
  // dir: current movement direction {x: -1|0|1, y: -1|0|1}
  // pendingDir: queued input direction (applied on next tick if valid)
  // food: {x,y} or null
  // score: integer
  // running: boolean indicating whether tick updates are active
  // tickIntervalMs: current tick interval in milliseconds (controls speed)
  // tickTimer: id returned by setInterval
  let snake, dir, pendingDir, food, score, running, tickIntervalMs, tickTimer;
  // High score persistence
  const STORAGE_KEY = 'snake_highscore_v1';
  let persistedHigh = 0; // value loaded from localStorage
  // Track whether the game is in a terminal game-over state.
  // While true, user must press Restart to begin a new game.
  let isGameOver = false;
  // Ensure we only trigger the 'surpassed high score' blink once per run
  let hasBlinkTriggered = false;

  /*
    reset()
    Initialize or restart the game state. Called on page load and when the user clicks Restart.
  */
  function reset(){
    const mid = Math.floor(GRID_SIZE/2);
    // start with a small snake of length 3 in the center moving to the right
    snake = [ {x: mid, y: mid}, {x: mid-1, y: mid}, {x: mid-2, y: mid} ];
    dir = {x:1,y:0};        // initial movement direction: right
    pendingDir = null;      // clear any queued input
    food = null;            // will be set by spawnFood
    score = 0;
    running = false;        // game starts paused until first input
    tickIntervalMs = 120;   // starting speed (ms per move). Lower = faster.

  // reset run-specific flags
  isGameOver = false;
  hasBlinkTriggered = false;

  // Re-enable pause button (disabled on game over)
  btnPause.disabled = false;
  btnPause.textContent = 'Pause';

    spawnFood();            // place the first food item
    render();               // initial draw
    updateHUD('Press Arrow keys or WASD to start');
  }

  /*
    spawnFood()
    Place food on a random empty cell. Uses a simple full-scan to collect free cells.
    For small grids this is fine and simple; for large grids consider maintaining a free-list.
  */
  function spawnFood(){
    const occupied = new Set(snake.map(p=>`${p.x},${p.y}`));
    const free = [];

    // Collect empty coordinates
    for(let x=0;x<GRID_SIZE;x++){
      for(let y=0;y<GRID_SIZE;y++){
        const key = `${x},${y}`;
        if(!occupied.has(key)) free.push({x,y});
      }
    }

    if(free.length===0){
      // No free cells left — treat as a win.
      food = null;
      running = false;
      updateHUD('You win! Board full.');
      return;
    }

    // Pick a random free cell for the food
    food = free[Math.floor(Math.random()*free.length)];
  }

  /* High score helpers */
  function loadHighScore(){
    try{
      const v = parseInt(localStorage.getItem(STORAGE_KEY));
      if(Number.isFinite(v)) persistedHigh = Math.max(0, v);
    } catch(e){ persistedHigh = 0; }
    updateHighScoreDisplay();
  }

  function saveHighScore(){
    try{ localStorage.setItem(STORAGE_KEY, String(persistedHigh)); } catch(e){}
  }

  function updateHighScoreDisplay(){
    if(highscoreEl) highscoreEl.textContent = `High Score: ${persistedHigh}`;
  }

  function triggerHighScoreBlink(){
    if(!highscoreEl) return;
    // Add blink class; CSS animation plays a few iterations then stops (defined in styles.css)
    highscoreEl.classList.add('blink');
    // Remove the class after animation completes (styles set 3 iterations * 0.6s = ~1.8s)
    window.setTimeout(()=> highscoreEl.classList.remove('blink'), 1900);
  }

  /*
    start()
    Begin the game loop. Called when the player presses a movement key for the first time or resumes.
  */
  function start(){
    if(running) return;
    running = true;
    updateHUD('Running');
    scheduleTick();
  }

  /*
    scheduleTick()
    (Re)start the interval used for updates. We clear the previous interval to avoid duplicates.
  */
  function scheduleTick(){
    clearInterval(tickTimer);
    tickTimer = setInterval(tick, tickIntervalMs);
  }

  /*
    tick()
    Single game update: apply queued input, compute the new head position, handle wrapping or wall collisions,
    detect self-collisions and food eating, move the snake, and redraw.
  */
  function tick(){
    // Apply any pending direction input (but prevent instant reversal)
    if(pendingDir){
      if(!(pendingDir.x === -dir.x && pendingDir.y === -dir.y)) dir = pendingDir;
      pendingDir = null;
    }

    // Compute next head position
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const wrap = wrapCheckbox.checked;

    // Handle wrap-around if enabled: use modulo arithmetic to wrap coordinates
    if(wrap){
      head.x = (head.x + GRID_SIZE) % GRID_SIZE;
      head.y = (head.y + GRID_SIZE) % GRID_SIZE;
    }

    // If wrap is disabled, hitting a wall is a game over
    if(!wrap && (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE)){
      return gameOver();
    }

    // Self-collision: if the head collides with any body segment, game over
    for(let i=0;i<snake.length;i++){
      if(snake[i].x===head.x && snake[i].y===head.y) return gameOver();
    }

    // Normal movement: add the new head to the front of the array
    snake.unshift(head);

    // Check if we ate food
    const ate = food && head.x===food.x && head.y===food.y;
    if(ate){
      score += 1;
      // Gradually speed up the game every 5 points (but keep a sensible lower limit)
      if(score % 5 === 0 && tickIntervalMs > 40) tickIntervalMs = Math.max(40, tickIntervalMs - 8);
      // If we've surpassed the saved high score this run, trigger a celebratory blink
      // but do NOT persist the new high until the game is actually over.
      if(score > persistedHigh && !hasBlinkTriggered){
        hasBlinkTriggered = true;
        triggerHighScoreBlink();
      }
      spawnFood();
    } else {
      // Remove the tail cell to keep the snake the same length when not eating
      snake.pop();
    }

    // Render the updated state and update HUD
    render();
    updateHUD(`Score: ${score}`);
  }

  /*
    gameOver()
    Stop the game loop and show a game-over message in the HUD.
  */
  function gameOver(){
    // Enter terminal game-over state. User must press Restart to play again.
    running = false;
    clearInterval(tickTimer);
    isGameOver = true;

    // If the score at the point of death is higher than the saved high score, persist it now.
    if(score > persistedHigh){
      persistedHigh = score;
      saveHighScore();
      updateHighScoreDisplay();
      // Optionally flash/highlight the high score on game over as well
      triggerHighScoreBlink();
    }

    // Disable pause while game is over to prevent accidental restart
    btnPause.disabled = true;

    updateHUD(`Game Over — score ${score}. Press Restart to play again.`);
  }

  /*
    updateHUD(text)
    Update HUD elements (score and status). Kept as a single function for convenience.
  */
  function updateHUD(text){
    scoreEl.textContent = `Score: ${score}`;
    statusEl.textContent = text;
  }

  /*
    render()
    Draw the current game state to the canvas. Uses CELL sized squares for grid cells.
    Rendering is intentionally simple and immediate (no double-buffering) which is fine for this small demo.
  */
  function render(){
    // Clear the canvas background
    ctx.fillStyle = '#071622';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw a subtle grid background to show cell boundaries
    ctx.fillStyle = '#071a28';
    for(let x=0;x<GRID_SIZE;x++){
      for(let y=0;y<GRID_SIZE;y++){
        const px = x*CELL, py = y*CELL;
        // leaving a 1px gap gives a crisp grid effect
        ctx.fillRect(px+1,py+1,CELL-2,CELL-2);
      }
    }

    // Draw food (if present)
    if(food){
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(food.x*CELL+2, food.y*CELL+2, CELL-4, CELL-4);
    }

    // Draw snake segments; head gets a distinct color
    for(let i=snake.length-1;i>=0;i--){
      const s = snake[i];
      ctx.fillStyle = (i===0) ? '#7bed9f' : '#2dd4bf';
      ctx.fillRect(s.x*CELL+2, s.y*CELL+2, CELL-4, CELL-4);
    }
  }

  /*
    Input handling
    - Arrow keys and WASD map to directions
    - 'P' toggles pause/resume
    - 'R' restarts

    We queue direction changes into `pendingDir` so multiple keypresses between ticks are handled
    predictably and we avoid immediate 180-degree reversals.
  */
  window.addEventListener('keydown', e => {
    const key = e.key;
    let d = null;
    if(key === 'ArrowUp' || key === 'w' || key === 'W') d = {x:0,y:-1};
    if(key === 'ArrowDown' || key === 's' || key === 'S') d = {x:0,y:1};
    if(key === 'ArrowLeft' || key === 'a' || key === 'A') d = {x:-1,y:0};
    if(key === 'ArrowRight' || key === 'd' || key === 'D') d = {x:1,y:0};
    if(key === 'p' || key === 'P') {
      togglePause();
      return;
    }
    if(key === 'r' || key === 'R') { reset(); return; }

    if(d){
      // Start the game when first movement input arrives, but only if we're not in a terminal game-over state.
      if(!running && !isGameOver) start();
      // Queue the direction to apply on the next tick
      pendingDir = d;
    }
  });

  // Wire up UI buttons to the same controls exposed to keyboard
  btnPause.addEventListener('click', togglePause);
  btnRestart.addEventListener('click', ()=> reset());

  /*
    togglePause()
    Pause or resume the game. We keep the same tick interval so resume continues where left off.
  */
  function togglePause(){
    // Don't allow pausing/resuming if the game is already over — user must Restart.
    if(isGameOver) return;

    if(!running){
      start();
      btnPause.textContent = 'Pause';
    } else {
      running = false;
      clearInterval(tickTimer);
      btnPause.textContent = 'Resume';
      updateHUD('Paused');
    }
  }

  /*
    resizeCanvas()
    Ensure the canvas backing store matches the displayed size multiplied by devicePixelRatio so
    drawing looks crisp on high-DPI displays. We also set the transform so drawing coordinates remain in CSS pixels.
  */
  function resizeCanvas(){
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(canvas.clientWidth * ratio);
    canvas.height = Math.floor(canvas.clientHeight * ratio);
  // Recompute CELL based on the canvas clientWidth (CSS pixels) so drawing
  // coordinates align with the transform/scale applied below.
  CELL = Math.floor(canvas.clientWidth / GRID_SIZE);
    // Scale drawing operations by the device pixel ratio so we can draw in CSS pixels
    ctx.setTransform(ratio,0,0,ratio,0,0);
  }
  window.addEventListener('resize', ()=>{ resizeCanvas(); render(); });

  // Initial setup: size the canvas and reset the game state
  resizeCanvas();
  loadHighScore();
  reset();

  // Expose a small debug API on window so you can call SnakeGame.reset() from the console
  window.SnakeGame = { reset, start };

})();
