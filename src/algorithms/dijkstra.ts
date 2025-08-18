// src/algorithms/dijkstra.ts
import { GridCell, Position } from "../types";

const minCostNode = (
    nodes: { [key: string]: GridCell },
    attrib: "cost"
): { [key: string]: GridCell } | null => {
    let minKey: string | null = null;
    let minValue = Infinity;
    for (const key in nodes) {
        if (nodes[key][attrib] < minValue) {
            minKey = key;
            minValue = nodes[key][attrib];
        }
    }
    return minKey ? { [minKey]: nodes[minKey] } : null;
};

const euclideanDistance = (node1: GridCell, node2: GridCell): number =>
    Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);

const getNeighbours = (grid: GridCell[][], node: GridCell): GridCell[] => {
    const possibleNeighbours = [
        { x: node.x - 1, y: node.y },
        { x: node.x, y: node.y + 1 },
        { x: node.x + 1, y: node.y },
        { x: node.x, y: node.y - 1 },
    ];

    return possibleNeighbours
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

export const dijkstra = (
    grid: GridCell[][],
    startPos: Position,
    endPos: Position
): [{ [key: string]: GridCell }, GridCell[]] | null => {
    const unvisitedNodes: { [key: string]: GridCell } = {};
    const visitedNodes: { [key: string]: GridCell } = {};
    let foundEndNode = false;

    // Initialize start and end cells
    grid[startPos.x][startPos.y].state = "start";
    grid[startPos.x][startPos.y].cost = 0;
    grid[endPos.x][endPos.y].state = "end";
    unvisitedNodes[`${startPos.x}x${startPos.y}`] = grid[startPos.x][startPos.y];

    while (Object.keys(unvisitedNodes).length > 0 && !foundEndNode) {
        const minNodeObj = minCostNode(unvisitedNodes, "cost");
        if (!minNodeObj) break;
        const currentNode = Object.values(minNodeObj)[0];

        if (currentNode.state === "end") {
            foundEndNode = true;
            visitedNodes[`${endPos.x}x${endPos.y}`] = currentNode;

            let retracedPath: GridCell[] = [];
            let currentRetrace = visitedNodes[`${endPos.x}x${endPos.y}`];
            while (currentRetrace.prevNode) {
                retracedPath.push(currentRetrace);
                currentRetrace = visitedNodes[currentRetrace.prevNode];
            }
            retracedPath.shift(); // Remove start node from path
            return [visitedNodes, retracedPath];
        }

        const neighbours = getNeighbours(grid, currentNode);
        for (const neighbour of neighbours) {
            const newCost = euclideanDistance(currentNode, neighbour);
            if (neighbour.cost > currentNode.cost + newCost) {
                grid[neighbour.x][neighbour.y].cost = currentNode.cost + newCost;
                grid[neighbour.x][neighbour.y].prevNode = currentNode.key;
            }
            const neighbourKey = `${neighbour.x}x${neighbour.y}`;
            if (!unvisitedNodes[neighbourKey]) {
                unvisitedNodes[neighbourKey] = neighbour;
            }
        }

        currentNode.visited = true;
        visitedNodes[currentNode.key] = currentNode;
        grid[currentNode.x][currentNode.y].visited = true;
        delete unvisitedNodes[`${currentNode.x}x${currentNode.y}`];
    }
    return [visitedNodes, []];
};
