// src/constants.ts
export const initialRows = 25;
export const initialColumns = 6;

export const cellStateColors = {
    empty: "white",
    wall: "#000000",
    start: "green",
    end: "red",
    visited: "rgb(175, 216, 248)",
    path: "rgb(255, 254, 106)"
};

// Number of cells to paint per batch when animating
export const ANIMATION_BATCH_SIZE = 2;
