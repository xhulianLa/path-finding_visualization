# Pathfinding Visualization

A React TypeScript application that visualizes various pathfinding algorithms in real-time. Users can create walls, generate mazes, and watch how different algorithms find their way from start to end points.

App can be viewed online at https://xhulianla.github.io/path-finding_visualization/

## Features

- Multiple pathfinding algorithms:
  - Dijkstra's Algorithm
  - A* Search
  - Depth-First Search (DFS)
  - Breadth-First Search (BFS)
- Interactive grid with drag-and-drop start/end points
- Wall drawing capability
- Maze generation
- Adjustable visualization speed
  
## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/pathfinding_visualization.git
cd pathfinding_visualization
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Usage

1. **Grid Interaction**:
   - Click and drag to create walls
   - Click and drag start (green) or end (red) points to relocate them
   - Click "Reset Grid" to clear all walls
   - Click "Reset Path" to clear the current path visualization

2. **Algorithm Selection**:
   - Choose an algorithm from the dropdown menu
   - Each algorithm has different characteristics:
     - Dijkstra: Guarantees shortest path, explores uniformly
     - A*: Uses heuristics for efficient pathfinding
     - DFS: Explores deeply before backtracking
     - BFS: Explores level by level

3. **Visualization Controls**:
   - Adjust speed using the speed dropdown
   - Watch the algorithm explore the grid in real-time

4. **Maze Generation**:
   - Click "Generate Maze" to create a random maze
   - The maze will maintain valid paths between start and end points

## Built With

- React
- TypeScript
- Vite
- CSS
