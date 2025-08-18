// src/App.tsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useReducer
} from "react";
import "./styles/App.css";
import GridElement from "./components/GridElement";
import { dijkstra } from "./algorithms/dijkstra";
import { aStar } from "./algorithms/astar";
import { dfs } from "./algorithms/dfs";
import { bfs } from "./algorithms/bfs";
import { generateMazeDFS } from "./algorithms/mazeGenerator";
import { GridCell, Position } from "./types";
import {
  initialRows,
  initialColumns,
  ANIMATION_BATCH_SIZE
} from "./constants";

// --- Types ---
type AlgorithmType = "dijkstra" | "aStar" | "dfs" | "bfs";
type DrawModeType = "wall" | "empty" | null;

interface AppState {
  grid: GridCell[][];
  algorithm: AlgorithmType;
  isRunning: boolean;
  drawMode: DrawModeType;
  start: Position;
  end: Position;
  isDraggingStart: boolean;
  isDraggingEnd: boolean;
}

type AppAction =
  | { type: "RESET_GRID" }
  | { type: "SET_GRID"; grid: GridCell[][] }
  | { type: "SET_CELL"; x: number; y: number; updates: Partial<GridCell> }
  | { type: "BATCH_UPDATE_CELLS"; updates: { [key: string]: Partial<GridCell> } }
  | { type: "SET_ALGORITHM"; algorithm: AlgorithmType }
  | { type: "SET_RUNNING"; isRunning: boolean }
  | { type: "SET_DRAW_MODE"; drawMode: DrawModeType }
  | { type: "SET_DRAGGING_START"; isDragging: boolean }
  | { type: "SET_DRAGGING_END"; isDragging: boolean }
  | { type: "MOVE_START"; newPos: Position }
  | { type: "MOVE_END"; newPos: Position };

// --- Helpers to create/reset the grid ---
const createInitialGrid = (): GridCell[][] => {
  const grid: GridCell[][] = [];
  for (let r = 0; r < initialRows; r++) {
    const row: GridCell[] = [];
    for (let c = 0; c < initialColumns; c++) {
      row.push({
        key: `${r}x${c}`,
        x: r,
        y: c,
        prevNode: null,
        visited: false,
        state: "empty",
        cost: Infinity
      });
    }
    grid.push(row);
  }
  const start: Position = {
    x: Math.floor(initialRows / 4),
    y: Math.floor(initialColumns / 4)
  };
  const end: Position = {
    x: Math.floor(initialRows / 4),
    y: Math.floor((3 * initialColumns) / 4)
  };
  grid[start.x][start.y].state = "start";
  grid[end.x][end.y].state = "end";
  return grid;
};

const initialState: AppState = {
  grid: createInitialGrid(),
  algorithm: "dijkstra",
  isRunning: false,
  drawMode: null,
  start: {
    x: Math.floor(initialRows / 4),
    y: Math.floor(initialColumns / 4)
  },
  end: {
    x: Math.floor(initialRows / 4),
    y: Math.floor((3 * initialColumns) / 4)
  },
  isDraggingStart: false,
  isDraggingEnd: false
};

// --- Reducer ---
function gridReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case "RESET_GRID":
      return { ...initialState, grid: createInitialGrid() };

    case "SET_GRID":
      return { ...state, grid: action.grid };

    case "SET_CELL":
      return {
        ...state,
        grid: state.grid.map((row, i) =>
          i === action.x
            ? row.map((cell, j) =>
              j === action.y ? { ...cell, ...action.updates } : cell
            )
            : row
        )
      };

    case "BATCH_UPDATE_CELLS":
      return {
        ...state,
        grid: state.grid.map((row) =>
          row.map((cell) => {
            const key = `${cell.x},${cell.y}`;
            return action.updates[key]
              ? { ...cell, ...action.updates[key] }
              : cell;
          })
        )
      };

    case "SET_ALGORITHM":
      return { ...state, algorithm: action.algorithm };

    case "SET_RUNNING":
      return { ...state, isRunning: action.isRunning };

    case "SET_DRAW_MODE":
      return { ...state, drawMode: action.drawMode };

    case "SET_DRAGGING_START":
      return { ...state, isDraggingStart: action.isDragging };

    case "SET_DRAGGING_END":
      return { ...state, isDraggingEnd: action.isDragging };

    case "MOVE_START": {
      const g = state.grid.map(r => [...r]);
      const { x: ox, y: oy } = state.start;
      g[ox][oy] = { ...g[ox][oy], state: "empty" };
      const { x: nx, y: ny } = action.newPos;
      g[nx][ny] = { ...g[nx][ny], state: "start" };
      return { ...state, grid: g, start: action.newPos };
    }

    case "MOVE_END": {
      const g = state.grid.map(r => [...r]);
      const { x: ox, y: oy } = state.end;
      g[ox][oy] = { ...g[ox][oy], state: "empty" };
      const { x: nx, y: ny } = action.newPos;
      g[nx][ny] = { ...g[nx][ny], state: "end" };
      return { ...state, grid: g, end: action.newPos };
    }

    default:
      return state;
  }
}

// --- Component ---
const App: React.FC = () => {
  const [state, dispatch] = useReducer(gridReducer, initialState);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState(25);
  const isDragging = useRef(false);
  const lastCell = useRef<Position | null>(null);

  // Keep latest grid in a ref for the algorithm
  const gridRef = useRef(state.grid);
  useEffect(() => {
    gridRef.current = state.grid;
  }, [state.grid]);

  // Global mouseup: end draw/drag
  useEffect(() => {
    const onUp = () => {
      setIsMouseDown(false);
      isDragging.current = false;
      lastCell.current = null;
      dispatch({ type: "SET_DRAW_MODE", drawMode: null });
      dispatch({ type: "SET_DRAGGING_START", isDragging: false });
      dispatch({ type: "SET_DRAGGING_END", isDragging: false });
    };
    document.addEventListener("mouseup", onUp);
    return () => document.removeEventListener("mouseup", onUp);
  }, []);

  // Briefly disable hover after mouse-up
  const [canHover, setCanHover] = useState(true);
  useEffect(() => {
    if (!isMouseDown) {
      setCanHover(false);
      const t = setTimeout(() => setCanHover(true), 50);
      return () => clearTimeout(t);
    }
  }, [isMouseDown]);

  // Simple delay
  const delay = useCallback(
    (ms: number = animationSpeed) =>
      new Promise<void>((res) => setTimeout(res, ms)),
    [animationSpeed]
  );

  // Handle initial click/drag start
  const handleMouseDown = useCallback(
    (x: number, y: number) => {
      if (state.isRunning) return;
      isDragging.current = false;
      lastCell.current = null;
      dispatch({ type: "SET_DRAGGING_START", isDragging: false });
      dispatch({ type: "SET_DRAGGING_END", isDragging: false });
      dispatch({ type: "SET_DRAW_MODE", drawMode: null });
      setIsMouseDown(true);

      // dragging start/end?
      if (x === state.start.x && y === state.start.y) {
        isDragging.current = true;
        lastCell.current = { x, y };
        dispatch({ type: "SET_DRAGGING_START", isDragging: true });
      } else if (x === state.end.x && y === state.end.y) {
        isDragging.current = true;
        lastCell.current = { x, y };
        dispatch({ type: "SET_DRAGGING_END", isDragging: true });
      } else {
        // draw wall/empty
        const cell = state.grid[x][y];
        const newState = cell.state === "wall" ? "empty" : "wall";
        dispatch({ type: "SET_DRAW_MODE", drawMode: newState as any });
        dispatch({ type: "SET_CELL", x, y, updates: { state: newState } });
      }
    },
    [state]
  );

  // Handle hover/drag over cells
  const handleMouseEnter = useCallback(
    (x: number, y: number) => {
      if (!isMouseDown || state.isRunning || !canHover) return;
      if (lastCell.current?.x === x && lastCell.current.y === y) return;
      lastCell.current = { x, y };

      if (isDragging.current) {
        // move start/end
        if (
          state.isDraggingStart &&
          state.grid[x][y].state !== "wall" &&
          !(x === state.end.x && y === state.end.y)
        ) {
          dispatch({ type: "MOVE_START", newPos: { x, y } });
        } else if (
          state.isDraggingEnd &&
          state.grid[x][y].state !== "wall" &&
          !(x === state.start.x && y === state.start.y)
        ) {
          dispatch({ type: "MOVE_END", newPos: { x, y } });
        }
        return;
      }

      // draw walls/empties
      if (
        (x === state.start.x && y === state.start.y) ||
        (x === state.end.x && y === state.end.y)
      )
        return;
      if (state.drawMode === "wall") {
        dispatch({ type: "SET_CELL", x, y, updates: { state: "wall" } });
      } else if (state.drawMode === "empty") {
        dispatch({ type: "SET_CELL", x, y, updates: { state: "empty" } });
      }
    },
    [isMouseDown, state, canHover]
  );

  const handleMouseUp = useCallback(() => {
    setIsMouseDown(false);
    isDragging.current = false;
    lastCell.current = null;
    dispatch({ type: "SET_DRAW_MODE", drawMode: null });
    dispatch({ type: "SET_DRAGGING_START", isDragging: false });
    dispatch({ type: "SET_DRAGGING_END", isDragging: false });
  }, []);

  const handleGridMouseLeave = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  const handleCellMouseUp = useCallback(
    () => {
      handleMouseUp();
    },
    [handleMouseUp]
  );

  // Reset path (keep walls)
  const resetPath = useCallback(() => {
    if (state.isRunning) return;
    const g2 = state.grid.map((row) =>
      row.map((cell) => {
        if (cell.state === "wall") {
          return { ...cell, visited: false, prevNode: null, cost: Infinity };
        }
        if (
          (cell.x === state.start.x && cell.y === state.start.y) ||
          (cell.x === state.end.x && cell.y === state.end.y)
        ) {
          return { ...cell, visited: false, prevNode: null, cost: Infinity };
        }
        return {
          ...cell,
          state: "empty" as const,
          visited: false,
          prevNode: null,
          cost: Infinity
        };
      })
    );
    dispatch({ type: "SET_GRID", grid: g2 });
    gridRef.current = g2;
  }, [state]);

  const resetGrid = useCallback(() => {
    if (state.isRunning) return;
    dispatch({ type: "RESET_GRID" });
  }, [state.isRunning]);

  const generateMaze = useCallback(async () => {
    if (state.isRunning) return;
    dispatch({ type: "SET_RUNNING", isRunning: true });
    try {
      // Start with fresh grid and current start/end
      const fresh = createInitialGrid();
      fresh[state.start.x][state.start.y].state = "start";
      fresh[state.end.x][state.end.y].state = "end";

      // Clear any stray default start/end
      for (let i = 0; i < fresh.length; i++) {
        for (let j = 0; j < fresh[0].length; j++) {
          if (
            (i === state.start.x && j === state.start.y) ||
            (i === state.end.x && j === state.end.y)
          )
            continue;
          if (fresh[i][j].state === "start" || fresh[i][j].state === "end") {
            fresh[i][j].state = "empty";
          }
        }
      }

      gridRef.current = fresh;

      // Run the maze generator
      const newGrid = await generateMazeDFS(
        fresh,
        state.start,
        10,
        async (g) => {
          dispatch({ type: "SET_GRID", grid: [...g] });
          gridRef.current = g;
        }
      );

      // **Re-insert** start & end after generation
      newGrid[state.start.x][state.start.y].state = "start";
      newGrid[state.end.x][state.end.y].state = "end";

      dispatch({ type: "SET_GRID", grid: newGrid });
      gridRef.current = newGrid;
    } catch (err) {
      console.error("Error generating maze:", err);
    } finally {
      dispatch({ type: "SET_RUNNING", isRunning: false });
    }
  }, [state.start, state.end, state.isRunning]);

  // Pick algorithm
  const runSelectedAlgorithm = useCallback(
    (g: GridCell[][], s: Position, e: Position) => {
      switch (state.algorithm) {
        case "dijkstra":
          return dijkstra(g, s, e);
        case "aStar":
          return aStar(g, s, e);
        case "dfs":
          return dfs(g, s, e);
        case "bfs":
          return bfs(g, s, e);
      }
    },
    [state.algorithm]
  );

  // Batch animation helper
  const animateBatch = useCallback(
    async (nodes: GridCell[], mode: "visited" | "path") => {
      for (let i = 0; i < nodes.length; i += ANIMATION_BATCH_SIZE) {
        const slice = nodes.slice(i, i + ANIMATION_BATCH_SIZE);
        const upd: Record<string, Partial<GridCell>> = {};
        slice.forEach((n) => {
          const key = `${n.x},${n.y}`;
          if (
            (n.x === state.start.x && n.y === state.start.y) ||
            (n.x === state.end.x && n.y === state.end.y)
          )
            return;
          upd[key] =
            mode === "visited"
              ? { state: "visited", visited: true }
              : { state: "path" };
        });
        dispatch({ type: "BATCH_UPDATE_CELLS", updates: upd });
        await delay();
      }
    },
    [delay, state]
  );

  // Start visualization
  const startAlgorithm = useCallback(async () => {
    if (state.isRunning) return;
    resetPath();
    await delay(5);

    const working = gridRef.current.map((r) => r.map((c) => ({ ...c })));
    dispatch({ type: "SET_RUNNING", isRunning: true });
    try {
      const result = runSelectedAlgorithm(
        working,
        state.start,
        state.end
      );
      if (!result) {
        dispatch({ type: "SET_RUNNING", isRunning: false });
        return;
      }
      const [visitedMap, path] = result;
      const visitedArr = Object.values(visitedMap);

      if (animationSpeed === 0) {
        // instant
        const upd: Record<string, Partial<GridCell>> = {};
        visitedArr.forEach((n) => {
          const k = `${n.x},${n.y}`;
          if (
            (n.x === state.start.x && n.y === state.start.y) ||
            (n.x === state.end.x && n.y === state.end.y)
          )
            return;
          upd[k] = { state: "visited", visited: true };
        });
        path.forEach((n) => {
          const k = `${n.x},${n.y}`;
          if (
            (n.x === state.start.x && n.y === state.start.y) ||
            (n.x === state.end.x && n.y === state.end.y)
          )
            return;
          upd[k] = { state: "path" };
        });
        dispatch({ type: "BATCH_UPDATE_CELLS", updates: upd });
        dispatch({ type: "SET_RUNNING", isRunning: false });
        return;
      }

      // animated
      await animateBatch(visitedArr, "visited");
      await animateBatch(path, "path");
    } catch (e) {
      console.error(e);
    } finally {
      dispatch({ type: "SET_RUNNING", isRunning: false });
    }
  }, [
    state,
    animationSpeed,
    delay,
    resetPath,
    runSelectedAlgorithm,
    animateBatch
  ]);

  return (
    <div
      className="App"
      style={{ "--anim-speed": `${animationSpeed}ms` } as React.CSSProperties}
    >
      <nav>
        <div className="nav-title">Pathfinding Visualizer</div>
        <div className="controls">
          <button
            className="control-btn"
            disabled={state.isRunning}
            onClick={startAlgorithm}
          >
            {state.isRunning ? "Running..." : "Start"}
          </button>
          <button
            className="control-btn"
            disabled={state.isRunning}
            onClick={resetPath}
          >
            Reset Path
          </button>
          <button
            className="control-btn"
            disabled={state.isRunning}
            onClick={resetGrid}
          >
            Reset Grid
          </button>
          <button
            className="control-btn"
            disabled={state.isRunning}
            onClick={generateMaze}
          >
            Generate Maze
          </button>
          <div>
            <label>Algorithm: </label>
            <select
              disabled={state.isRunning}
              value={state.algorithm}
              onChange={(e) =>
                dispatch({
                  type: "SET_ALGORITHM",
                  algorithm: e.target.value as AlgorithmType
                })
              }
            >
              <option value="dijkstra">Dijkstra</option>
              <option value="aStar">A*</option>
              <option value="dfs">DFS</option>
              <option value="bfs">BFS</option>
            </select>
          </div>
          <div>
            <label>Speed: </label>
            <select
              disabled={state.isRunning}
              value={animationSpeed}
              onChange={(e) => setAnimationSpeed(Number(e.target.value))}
            >
              <option value={0}>Instant (0 ms)</option>
              <option value={1}>Ultra (1 ms)</option>
              <option value={10}>Fast (10 ms)</option>
              <option value={50}>Med (50 ms)</option>
              <option value={200}>Slow (200 ms)</option>
            </select>
          </div>
        </div>
      </nav>

      <div
        className="gridContainer"
        onMouseMove={(e) => {
          if (e.buttons !== 1 || state.isRunning) return;
          const el = document.elementFromPoint(e.clientX, e.clientY);
          if (!el) return;
          const c = el.closest(".cell") as HTMLElement | null;
          if (!c) return;
          const x = c.dataset.x,
            y = c.dataset.y;
          if (x != null && y != null) handleMouseEnter(+x, +y);
        }}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleGridMouseLeave}
      >
        <div
          className="grid"
          style={{
            gridTemplateColumns: `repeat(${initialColumns}, 1fr)`,
            gridTemplateRows: `repeat(${initialRows}, 1fr)`
          }}
        >
          {state.grid.map((row) =>
            row.map((cell) => (
              <GridElement
                key={`${cell.x}-${cell.y}`}
                x={cell.x}
                y={cell.y}
                state={cell.state}
                onCellClick={handleMouseDown}
                onCellMouseUp={handleCellMouseUp}
                onMouseEnter={handleMouseEnter}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
