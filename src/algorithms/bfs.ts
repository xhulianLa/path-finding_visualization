// src/algorithms/bfs.ts
import { GridCell, Position } from "../types";
import { parseKey } from "./utils";

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

export const bfs = (
    grid: GridCell[][],
    startPos: Position,
    endPos: Position
): [{ [key: string]: GridCell }, GridCell[]] | null => {
    const queue: GridCell[] = [];
    const visited: { [key: string]: GridCell } = {};
    const startNode = grid[startPos.x][startPos.y];
    startNode.cost = 0;
    queue.push(startNode);

    while (queue.length > 0) {
        const node = queue.shift();
        if (!node) continue;
        if (node.visited) continue;
        node.visited = true;
        visited[node.key] = node;
        if (node.x === endPos.x && node.y === endPos.y) {
            const path: GridCell[] = [];
            let current: GridCell | undefined = node;
            while (current.prevNode) {
                path.push(current);
                const prevKey = current.prevNode as string;
                const { x: prevX, y: prevY } = parseKey(prevKey);
                current = visited[prevKey] || grid[prevX][prevY];
            }
            path.reverse();
            return [visited, path];
        }
        const neighbours = getNeighbours(grid, node);
        for (const neighbour of neighbours) {
            if (!neighbour.visited) {
                neighbour.prevNode = node.key;
                queue.push(neighbour);
            }
        }
    }
    return [visited, []];
};
