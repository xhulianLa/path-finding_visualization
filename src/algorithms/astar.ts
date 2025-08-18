// src/algorithms/astar.ts
import { GridCell, Position } from "../types";

// Use Manhattan distance for the heuristic.
const heuristic = (node: GridCell, end: GridCell): number =>
    Math.abs(node.x - end.x) + Math.abs(node.y - end.y);

export const aStar = (
    grid: GridCell[][],
    startPos: Position,
    endPos: Position
): [{ [key: string]: GridCell }, GridCell[]] | null => {
    const openSet: { [key: string]: GridCell } = {};
    const closedSet: { [key: string]: GridCell } = {};

    // Initialize start node.
    grid[startPos.x][startPos.y].cost = 0; // g score
    openSet[`${startPos.x}x${startPos.y}`] = grid[startPos.x][startPos.y];

    // Helper to get the f score of a node.
    const getF = (node: GridCell) => node.cost + heuristic(node, grid[endPos.x][endPos.y]);

    // Get the node in openSet with the minimum f score.
    const minFNode = (nodes: { [key: string]: GridCell }): GridCell | null => {
        let minKey: string | null = null;
        let minF = Infinity;
        for (const key in nodes) {
            const node = nodes[key];
            const f = getF(node);
            if (f < minF) {
                minF = f;
                minKey = key;
            }
        }
        return minKey ? nodes[minKey] : null;
    };

    // Get valid neighbours (up, down, left, right).
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

    while (Object.keys(openSet).length > 0) {
        const currentNode = minFNode(openSet);
        if (!currentNode) break;

        // If reached the end, reconstruct the path.
        if (currentNode.x === endPos.x && currentNode.y === endPos.y) {
            closedSet[currentNode.key] = currentNode;
            let retracedPath: GridCell[] = [];
            let temp = currentNode;
            while (temp.prevNode) {
                retracedPath.push(temp);
                // Retrieve the previous node from closedSet if available;
                // otherwise, parse its coordinates from the key.
                const [prevX, prevY] = temp.prevNode.split("x").map(Number);
                temp = closedSet[temp.prevNode] || grid[prevX][prevY];
            }
            retracedPath.shift(); // remove the start node from the path
            return [closedSet, retracedPath];
        }

        // Move currentNode from openSet to closedSet.
        delete openSet[currentNode.key];
        closedSet[currentNode.key] = currentNode;
        currentNode.visited = true;
        grid[currentNode.x][currentNode.y].visited = true;

        const neighbours = getNeighbours(grid, currentNode);
        for (const neighbour of neighbours) {
            const tentativeG = currentNode.cost + 1; // assume cost between adjacent cells is 1
            if (tentativeG < neighbour.cost) {
                neighbour.cost = tentativeG;
                neighbour.prevNode = currentNode.key;
                if (!openSet.hasOwnProperty(neighbour.key)) {
                    openSet[neighbour.key] = neighbour;
                }
            }
        }
    }

    // If no path is found, return the visited nodes and an empty path.
    return [closedSet, []];
};
