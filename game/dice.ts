interface GameDie {
    score: number;
    container: createjs.Container;
    cube: createjs.Shape;
    pips: createjs.Shape[];
}

const diePositions = [
    {x: 50, y: 50},
    {x: 200, y: 50},
    {x: 350, y: 50},
    {x: 50, y: 200},
    {x: 200, y: 200},
    {x: 350, y: 200}
];

const gridSize = 50;
const dieSize = 100;

//coordinates of each pip
var pipPositions = [
    {x: 50, y: 50},
    {x: 20, y: 20},
    {x: 20, y: 50},
    {x: 20, y: 80},
    {x: 80, y: 20},
    {x: 80, y: 50},
    {x: 80, y: 80},
];

//return an array of correct pips for the score
function pips(...indexes: number[]): createjs.Shape[] {
    return indexes.map(i => drawPip(pipPositions[i].x, pipPositions[i].y));
}

export function CreateGameDie(score:number): GameDie {
    var container = new createjs.Container();
    container.regX = dieSize / 2;
    container.regY = dieSize / 2;

    container.x = dieSize * -1;
    container.y = dieSize * -1;
    
    var cube = drawCube(0,0); 
    var pips = drawScore(score);

    container.addChild(drawCube(0,0));
    pips.forEach(p => container.addChild(p));
    
    return {
        score: score,
        container: container,
        cube: cube,
        pips: pips
    };
}

//draw all diece
export function drawDice(): GameDie[]
{
    //randomize die values
    var scores = Array.from(randomDice(diePositions.length));

    //create random die in each position
    return scores.map((score,i) => CreateGameDie(score));
}

//generate some random dice values
function* randomDice(count: number){
    var i = 0;
    while(i<count) {
        yield Math.floor((Math.random() * 6) + 1);
        i++;
    }
}

//draw the correct pips by location in the array for the score
function drawScore(score: number): createjs.Shape[] 
{
    switch(score){
        case 1: return pips(0);
        case 2: return pips(1,6);
        case 3: return pips(1,0,6);
        case 4: return pips(1,3,4,6);
        case 5: return pips(1,3,4,6,0);
        case 6: return pips(1,2,3,4,5,6);
    }
}


export function cubeStandard(g: createjs.Graphics) {
    return g.clear()
        .setStrokeStyle(1)
        .beginStroke("#000000")
        .beginFill("red")
        .drawRoundRect(0, 0, dieSize, dieSize, 5);
}

export function cubeSelected(g: createjs.Graphics) {
    return g.clear()
        .setStrokeStyle(3)
        .beginStroke("#000000")
        .beginFill("red")
        .drawRoundRect(0, 0, dieSize, dieSize, 8);
}

//draw a pip
function drawPip(x: number, y: number): createjs.Shape {
    var g = new createjs.Graphics();
    g.setStrokeStyle(1);
    g.beginStroke("#999999");
    g.beginFill('#fff');
    g.drawCircle(0,0,6);

    var shape = new createjs.Shape(g);
    shape.x = x;
    shape.y = y;

    return shape;
}

//draw a die cube
function drawCube(x: number, y: number) {
   
    var g = cubeStandard(new createjs.Graphics());
    // g.setStrokeStyle(1);
    // g.beginStroke("#000000");
    // g.beginFill("red");
    // g.drawRoundRect(0, 0, dieSize, dieSize, 5);

    var x = Math.floor(x / gridSize) * gridSize;
    var y = Math.floor(y / gridSize) * gridSize;

    var shape = new createjs.Shape(g);
    shape.x = x;
    shape.y = y;

    

    return shape;
}