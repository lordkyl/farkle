/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { drawDice } from './dice';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;

function load(elementId: string)
{
    canvas = <HTMLCanvasElement>document.getElementById(elementId);
    stage = new createjs.Stage(canvas);

    intro();
}

function restart(){
    //cleanup stage
    stage.removeAllChildren();
}



function intro(){
    //cleanup stage
    stage.removeAllChildren();

    var messageField = new createjs.Text("Insert Coin", "bold 24px Arial", "#333333");
	messageField.maxWidth = 640;
	messageField.textAlign = "center";
	messageField.textBaseline = "middle";
	messageField.x = canvas.width / 2;
    messageField.y = canvas.height / 2;
    //stage.addChild(messageField);

    drawDice().forEach(d => stage.addChild(d));

    stage.update();
}


window.onload = () => load('testCanvas');
