// src/algorithms/dfs.ts
import { GridCell, Position } from "../types";

const getNeighbours = (grid: GridCell[][], node: GridCell): GridCell[] => {
    const possible = [
        { x: node.x - 1, y: node.y },
        { x: node.x, y: node.y + 1 },
        { x: node.x + 1, y: node.y },
        { x: node.x, y: node.y - 1 },
    ];
    return possible
        .filter(
            (pos) =>
                pos.x >= 0 &&
                pos.x < grid.length &&
                pos.y >= 0 &&
                pos.y < grid[0].length
        )
        .map((pos) => grid[pos.x][pos.y])
        .filter((cell) => cell.state !== "wall" && !cell.visited);
};

// Fixed DFS implementation
export const dfs = (
    grid: GridCell[][],
    startPos: Position,
    endPos: Position
): [{ [key: string]: GridCell }, GridCell[]] => {
    // Create a clean working copy of the grid (crucial!)
    const workingGrid: GridCell[][] = grid.map(row =>
        row.map(cell => ({
            ...cell,
            visited: false,
            prevNode: null,
            cost: Infinity
        }))
    );

    // Mark walls as already visited to avoid even considering them
    for (let i = 0; i < workingGrid.length; i++) {
        for (let j = 0; j < workingGrid[0].length; j++) {
            if (workingGrid[i][j].state === "wall") {
                workingGrid[i][j].visited = true;
            }
        }
    }

    const stack: GridCell[] = [];
    const visited: { [key: string]: GridCell } = {};
    const startNode = workingGrid[startPos.x][startPos.y];
    startNode.cost = 0;

    stack.push(startNode);

    while (stack.length > 0) {
        const node = stack.pop();
        if (!node) continue;
        if (node.visited) continue;
        node.visited = true;
        visited[node.key] = node;
        if (node.x === endPos.x && node.y === endPos.y) {
            let path: GridCell[] = [];
            let current = node;
            while (current.prevNode) {
                path.push(current);
                const [prevX, prevY] = current.prevNode.split("x").map(Number);
                current = visited[current.prevNode] || workingGrid[prevX][prevY];
            }
            path.shift();
            return [visited, path];
        }
        const neighbours = getNeighbours(workingGrid, node);
        for (const neighbour of neighbours) {
            if (!neighbour.visited) {
                neighbour.prevNode = node.key;
                stack.push(neighbour);
            }
        }
    }
    return [visited, []];
};
