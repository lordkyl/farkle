/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;

function load(elementId: string)
{
    canvas = <HTMLCanvasElement>document.getElementById(elementId);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    createjs.Touch.enable(stage);
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

    createjs.Tween.get(ui.intro.message, { loop: 500})
        .wait(2000)
        .to({scale: 1.2}, 300, createjs.Ease.getPowInOut(2))
        .to({scale: 1}, 300, createjs.Ease.getPowInOut(2));

    ui.intro.event = stage.on('stagemouseup', start);
    stage.update();

    loadImage();
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
    toggleSelected(die);
    stage.update();
    
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

function loadImage() {
    var preload = new createjs.LoadQueue();
    preload.addEventListener("fileload", handleFileComplete);
    preload.loadFile("design/dice-cup.png");
}

function handleFileComplete(event) {
    //document.body.appendChild(event.result);
}

function shuffle(){
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
            .to({x: pos[i].x, y:pos[i].y, rotation:360}, 400, createjs.Ease.getPowOut(2));
    })

    stage.addChild(table);

}

function myturn(){
    stage.removeAllChildren();

    var bitmap = new createjs.Bitmap("design/dice-cup.png");    
    bitmap.shadow = new createjs.Shadow("#000", 2,2,20);
    bitmap.regX = 90;
    bitmap.regY = 75;
    bitmap.x = 320;
    bitmap.y = 200;
    stage.addChild(bitmap);

    var angle = 0;
    bitmap.on('rollover', function(evt: createjs.MouseEvent){
        createjs.Tween.get(evt.target).to({scale:1.075}, 67);
    });
    bitmap.on('rollout', function(evt: createjs.MouseEvent) {
        if (evt.nativeEvent.buttons == 0)
            createjs.Tween.get(evt.target).to({scale:1}, 67);
    }); 
    bitmap.on("pressmove", function(evt: createjs.MouseEvent) {
        if (evt.stageX > evt.target.x && angle < 50) {
            angle +=  ((evt.stageX - evt.target.x) / 15);
        }else if (evt.stageX < evt.target.x && angle > -50) {
            angle -=  ((evt.target.x - evt.stageX) / 15);
        }

        createjs.Tween.get(evt.target).to({x:evt.stageX + (angle / 2), rotation: angle}, 100);
    });
    bitmap.on('pressup', function(evt: createjs.MouseEvent) {
        createjs.Tween.get(evt.target)
            .to({x: -200, y: -200, rotation: 140}, 600)
            .call(()=>shuffle());
    }); 

}

window.onload = () => load('game-canvas');
