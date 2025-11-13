export interface TutorialPage {
  title: string;
  description: React.ReactNode;
  media?: {
    src: string;
    alt?: string;
    type?: "image" | "video";
  };
}

export const TUTORIAL_PAGES: TutorialPage[] = [
  {
    title: "Welcome to the Pathfinding Visualizer!",
    description: (
      <>
        <p>
          This app lets you visualize classic pathfinding algorithms explore a grid
          in real time. Toggle walls, move the start/end nodes, and see how each
          strategy behaves.
        </p>
        <p>
          If you want to skip the tutorial, click the "Skip" button below.
          Otherwise click "Next" to continue.
        </p>
      </>
    ),
    media: {
      src: "./intro.png",
      alt: "Image of a path between a start and end node"
    }
  },
  {
    title: "What is a pathfinding algorithm?",
    description: (
      <>
        <p>
          It&apos;s a step-by-step method for finding a route between two
          points. Some algorithms guarantee the shortest path (Dijkstra, A*),
          while others simply explore until they hit the goal (DFS, BFS).
        </p>
        <ul>
          <li>BFS explores evenly outward layer by layer.</li>
          <li>Dijkstra weighs distance cost from the start.</li>
          <li>A* combines cost + heuristic to aim toward the goal.
            Arguably the best pathfinding algorithm</li>
        </ul>
      </>
    ),
    media: {
      src: "./AB.jpg",
      alt: "Image showing a line between point A and point B"
    }
  },
  {
    title: "How to use the visualizer - Choose algorithm and speed",
    description: (
      <>
        <p>
          You can select different pathfinding algorithms and adjust animation speeds
          from the dropdown menus in the navbar.
        </p>
      </>
    ),
    media: {
      src: "./choose_algorithm.gif",
      alt: "Pathfinding visualizer preview"
    }
  },
  {
    title: "How to use the visualizer - Drawing and erasing walls",
    description: (
      <>
        <p>
          Walls are obstacles that block the path. Click and drag on the grid to add
          walls.
        </p>
        <p>
          Start erasing walls by clicking and dragging from within a wall cell.
        </p>
      </>
    ),
    media: {
      src: "./walls.gif",
      alt: "Pathfinding visualizer preview of adding walls"
    }
  },
  {
    title: "How to use the visualizer - Move start/end nodes",
    description: (
      <>
        <p>
          Click and drag the start node 🟩 or the end node 🟥 to reposition them
          anywhere on the grid.
        </p>
        <p>
          This allows you to set up different scenarios and see how the algorithms
          routes the shortest path.
        </p>
      </>
    ),
    media: {
      src: "./move_node.gif",
      alt: "Pathfinding visualizer preview of moving nodes"
    }
  },
  {
    title: "How to use the visualizer - Visualize pathfinding algorithm",
    description: (
      <>
        <p>
          Once you&apos;ve set up the grid, click the &quot;Visualize&quot; button
          to see the selected algorithm in action.
        </p>
        <p>
          You can also reset the grid at any time using the &quot;Reset&quot; button.
          The &quot;Reset path&quot; button only clears the path but keeps walls intact.
          You can randomly generate walls using the &quot;Generate Maze&quot; button, try it out!
        </p>
      </>
    ),
    media: {
      src: "./navbar.png",
      alt: "Pathfinding visualizer preview of navbar"
    }
  }
];