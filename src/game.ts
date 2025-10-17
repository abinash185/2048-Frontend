export type Cell = number | null;
export type Row = Cell[];
export type Board = Row[]; // square board
export type Direction = 'up' | 'down' | 'left' | 'right';

export interface GameState {
  board: Board;
  size: number;
  score: number;
  won: boolean;
  over: boolean;
}

/* ---------- Utilities (pure) ---------- */

export const createEmptyBoard = (size: number): Board =>
  Array.from({ length: size }, () => Array.from({ length: size }, () => null));

export const cloneBoard = (board: Board): Board => board.map(row => row.slice());

const getRandomInt = (max: number) => Math.floor(Math.random() * max);

export const addRandomTile = (board: Board): { board: Board; placed: boolean } => {
  const empty: Array<{ r: number; c: number }> = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === null) empty.push({ r, c });
    })
  );
  if (empty.length === 0) return { board, placed: false };
  const choice = empty[getRandomInt(empty.length)];
  const tile = Math.random() < 0.9 ? 2 : 4;
  const newBoard = cloneBoard(board);
  newBoard[choice.r][choice.c] = tile;
  return { board: newBoard, placed: true };
};

/* transpose & reverse helpers */
export const transpose = (board: Board): Board =>
  board[0].map((_, c) => board.map(row => row[c]));

export const reverseRows = (board: Board): Board => board.map(row => row.slice().reverse());

/* slide & merge a single row to the left. Returns new row and score gained */
export const slideAndMergeRow = (row: Row): { newRow: Row; gained: number } => {
  const filtered = row.filter((v): v is number => v !== null);
  const result: number[] = [];
  let gained = 0;
  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2;
      result.push(merged);
      gained += merged;
      i += 2;
    } else {
      result.push(filtered[i]);
      i += 1;
    }
  }
  // pad with nulls
  while (result.length < row.length) result.push(null as any);
  // ensure type: number | null
  return { newRow: result.map(v => (v === null ? null : v)), gained };
};

/* apply move left to whole board */
export const moveLeft = (board: Board): { board: Board; moved: boolean; gained: number } => {
  const newBoard: Board = [];
  let moved = false;
  let gained = 0;
  for (const row of board) {
    const { newRow, gained: g } = slideAndMergeRow(row);
    newBoard.push(newRow);
    if (JSON.stringify(newRow) !== JSON.stringify(row)) moved = true;
    gained += g;
  }
  return { board: newBoard, moved, gained };
};

export const moveRight = (board: Board) => {
  const reversed = reverseRows(board);
  const { board: m, moved, gained } = moveLeft(reversed);
  return { board: reverseRows(m), moved, gained };
};

export const moveUp = (board: Board) => {
  const t = transpose(board);
  const { board: m, moved, gained } = moveLeft(t);
  return { board: transpose(m), moved, gained };
};

export const moveDown = (board: Board) => {
  const t = transpose(board);
  const { board: m, moved, gained } = moveRight(t);
  return { board: transpose(m), moved, gained };
};

/* check if any move available */
export const hasMoves = (board: Board): boolean => {
  const size = board.length;
  // empty cell => move available
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (board[r][c] === null) return true;
  // check merges horizontally or vertically
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size - 1; c++)
      if (board[r][c] === board[r][c + 1]) return true;
  for (let c = 0; c < size; c++)
    for (let r = 0; r < size - 1; r++)
      if (board[r][c] === board[r + 1][c]) return true;
  return false;
};

/* create new game state */
export const newGame = (size = 4): GameState => {
  let board = createEmptyBoard(size);
  // add two tiles
  let placed = addRandomTile(board);
  board = placed.board;
  placed = addRandomTile(board);
  board = placed.board;
  return { board, size, score: 0, won: false, over: false };
};

/* apply a direction move to state (pure): returns new state */
export const applyMove = (state: GameState, dir: Direction): GameState => {
  const mover =
    dir === 'left' ? moveLeft : dir === 'right' ? moveRight : dir === 'up' ? moveUp : moveDown;
  const { board: movedBoard, moved, gained } = mover(state.board);
  if (!moved) return { ...state }; // no change
  // add random tile
  const { board: afterAdd } = addRandomTile(movedBoard);
  const newScore = state.score + gained;
  const won = afterAdd.some(row => row.some(cell => cell === 2048)) || state.won;
  const over = !hasMoves(afterAdd);
  return { board: afterAdd, size: state.size, score: newScore, won, over };
};
