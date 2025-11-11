export const parseKey = (key: string): { x: number; y: number } => {
    const parts = key.split("x");
    const xStr = parts[0] ?? "0";
    const yStr = parts[1] ?? "0";
    return {
        x: Number(xStr),
        y: Number(yStr),
    };
};
