export const initialRows = 22;
export const initialColumns = 61;

export const MIN_ROWS = 8;
export const MIN_COLUMNS = 12;
export const MIN_CELL_SIZE = 18;
const GRID_HORIZONTAL_PADDING = 40;
const GRID_VERTICAL_PADDING = 220;

export interface GridMetrics {
    rows: number;
    cols: number;
    cellSize: number;
}

export const FALLBACK_VIEWPORT = { width: 1280, height: 720 };

export const calculateResponsiveGrid = (
    viewportWidth: number,
    viewportHeight: number
): GridMetrics => {
    const usableWidth = Math.max(
        MIN_COLUMNS * MIN_CELL_SIZE,
        viewportWidth - GRID_HORIZONTAL_PADDING
    );
    const usableHeight = Math.max(
        MIN_ROWS * MIN_CELL_SIZE,
        viewportHeight - GRID_VERTICAL_PADDING
    );

    const cols = Math.max(
        MIN_COLUMNS,
        Math.min(initialColumns, Math.floor(usableWidth / MIN_CELL_SIZE))
    );
    const rows = Math.max(
        MIN_ROWS,
        Math.min(initialRows, Math.floor(usableHeight / MIN_CELL_SIZE))
    );

    const cellSize = Math.max(
        MIN_CELL_SIZE,
        Math.floor(Math.min(usableWidth / cols, usableHeight / rows))
    );

    return { rows, cols, cellSize };
};

export const cellStateColors = {
    empty: "white",
    wall: "#000000",
    start: "green",
    end: "red",
    visited: "rgb(175, 216, 248)",
    path: "rgb(255, 254, 106)"
};

export const ANIMATION_BATCH_SIZE = 2;
