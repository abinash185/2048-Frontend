# 2048 (React + TypeScript) — GUI only

## Overview
This is a functional implementation of the 2048 game with a React + TypeScript GUI. The game logic is implemented using pure functions and immutable updates to make it easy to test and reason about.

## Features
- Default board 4×4 (configurable to 3×3, 5×5, 6×6)
- Start with two random tiles (2 or 4)
- Slide left/right/up/down (keyboard & GUI buttons)
- Merge same tiles; score updates on merges
- New tile (2 or 4) after each valid move
- Win detection (2048) and Game Over detection
- Restart from UI
- Modular functional code suitable for unit tests

## How to run
```bash
npm install
npm start
# open http://localhost:5173
