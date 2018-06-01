const gridSize = 50;
const dieSize = 100;


export function drawDie(x: number, y: number, score: number): createjs.Container {
    var result = new createjs.Container();
    result.x = x;
    result.y = y;
    
    result.addChild(drawCube(0,0));
    drawScore(score).forEach(p=>result.addChild(p));

    return result;
}



export function drawDice(): createjs.Container[]
{
    //all 6 dice positions
    var positions = [
        {x: 50, y: 50},
        {x: 200, y: 50},
        {x: 350, y: 50},
        {x: 50, y: 200},
        {x: 200, y: 200},
        {x: 350, y: 200}
    ];
        
    //randomize die values
    var scores = Array.from(randomDice());

    //create random die in each position
    return scores.map((score,i) => drawDie(positions[i].x, positions[i].y, score));
}

function* randomDice(){
    var i = 0;
    while(i<6) {
        yield Math.floor((Math.random() * 6) + 1);
        i++;
    }
}

function drawScore(score: number): createjs.Shape[] 
{
    var pips = drawPips();

    //return elements from an array by index
    const pos = (...indexes: number[]) => indexes.map(i => pips[i]);
    
    switch(score){
        case 1: return pos(0);
        case 2: return pos(1,6);
        case 3: return pos(1,0,6);
        case 4: return pos(1,3,4,6);
        case 5: return pos(1,3,4,6,0);
        case 6: return pos(1,2,3,4,5,6);
    }
}

function drawPips(): createjs.Shape[] 
{
    return [
        drawPip(50, 50),
        drawPip(20, 20),
        drawPip(20, 50),
        drawPip(20, 80),
        drawPip(80, 20),
        drawPip(80, 50),
        drawPip(80, 80),
    ]
}

function drawPip(x: number, y: number) {
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

function drawCube(x: number, y: number) {
   
    var g = new createjs.Graphics();
    g.setStrokeStyle(1);
    g.beginStroke("#000000");
    g.beginFill("red");
    g.drawRoundRect(0, 0, dieSize, dieSize, 5);

    var x = Math.floor(x / gridSize) * gridSize;
    var y = Math.floor(y / gridSize) * gridSize;

    var shape = new createjs.Shape(g);
    shape.x = x;
    shape.y = y;

    

    return shape;
}