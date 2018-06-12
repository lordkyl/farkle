const gridSize = 50;
const dieSize = 100;


export interface GameDie {
    score: number;
    container: createjs.Container;
    cubes: createjs.Shape[]; 
    pips: createjs.Shape[];
}


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

export function toggleSelected(die: GameDie){
    die.cubes.forEach(c => c.visible = !c.visible);
}

export function createGameDie(score:number): GameDie {
    var container = new createjs.Container();
    container.regX = dieSize / 2;
    container.regY = dieSize / 2;

    container.x = dieSize * -1;
    container.y = dieSize * -1;
    
    var pips = drawScore(score);

    pips.forEach(p => container.addChild(p));
    
    var result = {
        score: score,
        container: container,
        cubes: [drawCube(StandardCubeStyle), drawCube(SelectedCubeStyle, false)],
        pips: pips
    };

    [...result.cubes, ...result.pips].forEach(p=>container.addChild(p));

    return result;
}

//draw all diece
export function drawDice(): GameDie[]
{
    //randomize die values
    var scores = Array.from(randomDice(6));

    //create random die in each position
    return scores.map((score,i) => createGameDie(score));
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


interface GameCubeStyle {
    strokeWidth: number;
    strokeColor: string;
    fillColor: string;
    x: number;
    y: number;
    width: number;
    height: number;
    radius: number;
}

const StandardCubeStyle : GameCubeStyle = {
    strokeWidth: 1,
    strokeColor: "#000000",
    fillColor: "red",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    radius: 5
}

const SelectedCubeStyle : GameCubeStyle = {
    strokeWidth: 3,
    strokeColor: "#000000",
    fillColor: "red",
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    radius: 8
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
function drawCube(style: GameCubeStyle, visible: boolean = true) {
   
    var g = new createjs.Graphics();
    g.setStrokeStyle(style.strokeWidth);
    g.beginStroke(style.strokeColor);
    g.beginFill(style.fillColor);
    g.drawRoundRect(0,0, style.width, style.height, style.radius);

    var x = Math.floor(x / gridSize) * gridSize;
    var y = Math.floor(y / gridSize) * gridSize;

    var shape = new createjs.Shape(g);
    shape.x = 0;
    shape.y = 0;
    shape.visible = visible;

    return shape;
}