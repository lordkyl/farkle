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

    ui.intro.message = new createjs.Text("Insert Coin", "bold 24px Arial", "#333333");
	ui.intro.message.maxWidth = 640;
	ui.intro.message.textAlign = "center";
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
        .to({x:x, y:300, scale:0.5}, 500, createjs.Ease.getPowOut(2));
}

function myturn(){
    stage.removeAllChildren();

    var dice = drawDice();
    var table = new createjs.Container();
    table.x = 20;
    table.y = 20;

    dice.forEach(d => table.addChild(d.container));

    stage.addChild(table);

    //stage.addChild(dice[0]);

    const pos = [
        {x: 50, y: 50},
        {x: 200, y: 50},
        {x: 350, y: 50},
        {x: 50, y: 200},
        {x: 200, y: 200},
        {x: 350, y: 200}
    ];

    dice.forEach((d,i) => {
        d.container.on('rollover', ()=>rolloverout(d));
        d.container.on('rollout', ()=>rolloverout(d));
        d.container.on('click', ()=>selectDie(d));
        d.container.x = -100;
        d.container.y = -100;
        createjs.Tween.get(d.container)
            .to({x: pos[i].x, y:pos[i].y, rotation:360}, 600, createjs.Ease.getPowIn(2));
    })

}



window.onload = () => load('testCanvas');
