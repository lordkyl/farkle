/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;

function load(elementId: string)
{
    canvas = <HTMLCanvasElement>document.getElementById(elementId);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", stage);        
    intro();
}

var ui = {
    intro: {
        message: null,
        event: null
    }
};

function intro(){
    //cleanup stage
    stage.removeAllChildren();

    ui.intro.message = new createjs.Text("Click to Start!", "bold 24px Arial", "#ffffff");
	ui.intro.message.maxWidth = 640;
    ui.intro.message.textAlign = "center";
    ui.intro.message.shadow = new createjs.Shadow("#000000", 5, 5, 10);
	ui.intro.message.textBaseline = "middle";
	ui.intro.message.x = canvas.width / 2;
    ui.intro.message.y = canvas.height / 2;
    stage.addChild(ui.intro.message);

    ui.intro.event = stage.on('stagemouseup', start);
    stage.update();
}

function start(){
    stage.off('stagemouseup', ui.intro.event);

    createjs.Tween.get(ui.intro.message)
        .to({alpha:0}, 300, createjs.Ease.getPowOut(2))
        .call(myturn);

}

function rolloverout(die: GameDie){
    toggleSelected(die);
    stage.update();
}

var selected: GameDie[] = [];

function selectDie(die: GameDie){

    selected.push(die);

    let x = (selected.length-1) * 60 + 20;
    createjs.Tween.get(die.container)
        .to({scale:1.2}, 200, createjs.Ease.getPowIn(2))
        .to({x:x, y:0, scale:0.5}, 500, createjs.Ease.getPowOut(2));
}

const pos = [
    {x: 50, y: 200},
    {x: 200, y: 200},
    {x: 350, y: 200},
    {x: 50, y: 350},
    {x: 200, y: 350},
    {x: 350, y: 350}
];

function myturn(){
    stage.removeAllChildren();

    var dice = drawDice();
    var table = new createjs.Container();
    table.x = 120;
    table.y = 40;

    dice.forEach((d,i) => {
        table.addChild(d.container)        
        d.container.on('rollover', ()=>rolloverout(d));
        d.container.on('rollout', ()=>rolloverout(d));
        d.container.on('click', ()=>selectDie(d));
        d.container.x = -100;
        d.container.y = -100;
        createjs.Tween.get(d.container)
            .to({x: pos[i].x, y:pos[i].y, rotation:360}, 600, createjs.Ease.getPowIn(2));
    })

    stage.addChild(table);
}

window.onload = () => load('game-canvas');
