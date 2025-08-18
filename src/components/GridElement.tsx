import { memo } from "react";
import "../styles/GridElement.css";

interface GridElementProps {
    x: number;
    y: number;
    state: "empty" | "wall" | "start" | "end" | "visited" | "path";
    onCellClick: (x: number, y: number) => void;
    onCellMouseUp: (x: number, y: number) => void;
    onMouseEnter: (x: number, y: number) => void;
}

const GridElement = memo(({ x, y, state, onCellClick, onCellMouseUp, onMouseEnter }: GridElementProps) => {
    const className = `cell ${state}`;
    return (
        <div
            className={className}
            data-x={x}
            data-y={y}
            onMouseDown={e => { e.preventDefault(); onCellClick(x, y); }}
            onMouseUp={e => { e.preventDefault(); onCellMouseUp(x, y); }}
            onMouseEnter={e => { if (e.buttons !== 1) return; e.preventDefault(); onMouseEnter(x, y); }}
        >
            <div className={state === "visited" ? "inner_visited" : "inner"} />
        </div>
    );
}, (p, n) => p.state === n.state);

export default GridElement;
