export const dicePositions = [
    {x: 50, y: 200},
    {x: 200, y: 200},
    {x: 350, y: 200},
    {x: 50, y: 350},
    {x: 200, y: 350},
    {x: 350, y: 350}
];

export const pipPositions = [
    {x: 50, y: 50},
    {x: 20, y: 20},
    {x: 20, y: 50},
    {x: 20, y: 80},
    {x: 80, y: 20},
    {x: 80, y: 50},
    {x: 80, y: 80},
];

export interface Position
{
    x: number;
    y: number;
}

export function selectedPositions(index: number): Position
{
    let max = 7;

    return {
        y: Math.floor(index / max) * 60,
        x: (index % max) * 60
    }
}