export interface GridCell {
    key: string;
    x: number;
    y: number;
    prevNode: string | null;
    visited: boolean;
    state: "empty" | "wall" | "start" | "end" | "visited" | "path"; // Add more specific types
    cost: number;
}

export interface Position {
    x: number;
    y: number;
}