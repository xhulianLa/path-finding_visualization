// src/algorithms/mazeGenerator.ts
import { GridCell, Position } from "../types";
import { cellStateColors } from "../constants";


/**
 * Generates a maze using a recursive backtracker (DFS) algorithm.
 * The grid is assumed to be fully filled with walls initially.
 * Only cells with odd indices will be carved as passages.
 *
 * @param grid The current grid
 * @param start The desired start position (will be adjusted to odd coordinates)
 * @param stepDelay Delay between visualization steps (ms)
 * @param update A callback to update the grid state for visualization
 * @returns A Promise that resolves to the updated grid after maze generation.
 */
export const generateMazeDFS = async (
    grid: GridCell[][],
    start: Position,
    delay: number,
    updateVisualization: (grid: GridCell[][]) => Promise<void>
): Promise<GridCell[][]> => {
    // First, fill the entire grid with walls
    const newGrid: GridCell[][] = grid.map(row =>
        row.map(cell => ({
            ...cell,
            state: "wall" as const,
            color: cellStateColors.wall
        }))
    );

    // Find end position from the grid
    let end: Position | undefined;
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j].state === "end") {
                end = { x: i, y: j };
                break;
            }
        }
        if (end) break;
    }

    if (!end) {
        throw new Error("End position not found in grid");
    }

    // Preserve start and end
    newGrid[start.x][start.y].state = "start";
    newGrid[end.x][end.y].state = "end";

    // Start carving paths
    const stack: [number, number][] = [];
    const startX = 1; // Starting point for maze generation
    const startY = 1;
    stack.push([startX, startY]);

    // Mark starting point as empty
    newGrid[startX][startY].state = "empty" as const;

    await updateVisualization([...newGrid] as GridCell[][]);

    // Generate the maze base
    while (stack.length > 0) {
        const [x, y] = stack[stack.length - 1];

        // Get unvisited neighbors (cells two steps away)
        const neighbors = getUnvisitedNeighbors(newGrid, x, y);

        if (neighbors.length === 0) {
            stack.pop();
            continue;
        }

        // Choose random neighbor
        const [nx, ny] = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Calculate cell between current and neighbor
        const wx = x + (nx - x) / 2;
        const wy = y + (ny - y) / 2;

        // Carve path by setting cells to empty
        newGrid[wx][wy].state = "empty" as const;
        newGrid[nx][ny].state = "empty" as const;

        // Add new position to stack
        stack.push([nx, ny]);

        // Update visualization
        if (delay > 0) {
            await new Promise(resolve => setTimeout(resolve, delay));
            await updateVisualization([...newGrid] as GridCell[][]);
        }
    }

    // AFTER maze generation, ensure paths to start and end nodes
    ensurePathToNode(newGrid as GridCell[][], start);
    ensurePathToNode(newGrid as GridCell[][], end);

    // Make sure start and end are still properly marked
    newGrid[start.x][start.y].state = "start";
    newGrid[end.x][end.y].state = "end";

    return newGrid;
};

// Helper function to ensure a path exists to a node
const ensurePathToNode = (grid: GridCell[][], node: Position): void => {
    // Find the nearest empty cell
    let nearestEmpty: Position | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid[0].length; j++) {
            if (grid[i][j].state === "empty") {
                const distance = Math.abs(i - node.x) + Math.abs(j - node.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestEmpty = { x: i, y: j };
                }
            }
        }
    }

    if (!nearestEmpty) return; // No empty cells found

    // Create a path from the nearest empty cell to the node
    let currentX = nearestEmpty.x;
    let currentY = nearestEmpty.y;

    // Move horizontally first
    while (currentX !== node.x) {
        currentX = currentX < node.x ? currentX + 1 : currentX - 1;
        // Don't overwrite start or end
        if (!(grid[currentX][currentY].state === "start" || grid[currentX][currentY].state === "end")) {
            grid[currentX][currentY].state = "empty";
        }
    }

    // Then move vertically
    while (currentY !== node.y) {
        currentY = currentY < node.y ? currentY + 1 : currentY - 1;
        // Don't overwrite start or end
        if (!(grid[currentX][currentY].state === "start" || grid[currentX][currentY].state === "end")) {
            grid[currentX][currentY].state = "empty";
        }
    }
};

// Helper function to get unvisited neighbors
const getUnvisitedNeighbors = (grid: GridCell[][], x: number, y: number): [number, number][] => {
    const neighbors: [number, number][] = [];
    const directions = [[-2, 0], [0, -2], [2, 0], [0, 2]]; // Look two cells away

    for (const [dx, dy] of directions) {
        const nx = x + dx;
        const ny = y + dy;

        // Check if in bounds
        if (nx < 0 || nx >= grid.length || ny < 0 || ny >= grid[0].length) {
            continue;
        }

        // Check if unvisited (wall)
        if (grid[nx][ny].state === "wall") {
            neighbors.push([nx, ny]);
        }
    }

    return neighbors;
};
