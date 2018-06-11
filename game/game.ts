/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { drawDice, cubeSelected, cubeStandard } from './dice';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;

function load(elementId: string)
{
    canvas = <HTMLCanvasElement>document.getElementById(elementId);
    stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
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

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", stage);        
    
    //stage.removeAllChildren();

    //myturn();
    //stage.update();
}

function myturn(){
    stage.removeAllChildren();

    var dice = drawDice();
    dice.forEach(d => stage.addChild(d.container));

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
        d.container.on('rollover', ()=>{
            cubeSelected(d.cube.graphics);
            stage.update();
        });
        d.container.on('rollout', ()=>cubeStandard(d.cube.graphics));

        d.container.x = i * 100;
        d.container.y = i * 100;
        //createjs.Tween.get(d.container)
            //.to({x: pos[i].x, y:pos[i].y, rotation:360}, 1000, createjs.Ease.getPowIn(2));
    })

}



window.onload = () => load('testCanvas');
