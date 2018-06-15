/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';
import { introText, scoreText } from './text';
import { dicePositions } from './layout';
import { load, LoadResult } from './loader';
import { setupGameBoard, showButtons, showCup } from './interface';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;
var spriteSheet: createjs.SpriteSheet;
var loadQueue: createjs.LoadQueue;
var table: createjs.Container;
var quantity = 6;
var score: createjs.Text;

//load and run
window.onload = () => load('game-canvas').then(setup);

var dice: GameDie[] = [];
var selected = () => dice.filter(d=>d.selected);

function setup(loaded: LoadResult){
    canvas = loaded.canvas;
    stage = loaded.stage;
    spriteSheet = loaded.sprites;
    loadQueue = loaded.loadQueue;
    table = setupGameBoard(loaded, rollagain, doneturn, roll);
    intro();
}


function intro(){
    var msg = introText();
	msg.x = canvas.width / 2;
    msg.y = canvas.height / 2;
    stage.addChild(msg);

    score = scoreText();
    stage.addChild(score).set({visible:false});

    createjs.Tween.get(msg, { loop: 500})
        .wait(2000)
        .to({scale: 1.2}, 300, createjs.Ease.getPowInOut(2))
        .to({scale: 1}, 300, createjs.Ease.getPowInOut(2));

    var startEvent = stage.on('stagemouseup', () => {
        createjs.Tween.get(msg)
        .to({alpha:0}, 300, createjs.Ease.getPowOut(2))
        .call(() => {
            stage.off('stagemouseup', startEvent);
            stage.removeChild(msg);
            showCup();
        });
    });

    stage.update();
}

function rolloverout(die: GameDie){
    toggleSelected(die);
    stage.update();
}

function selectDie(die: GameDie){
    //count the number of existing selected dice
    let count = selected().length;

    //mark the die as selected
    die.selected = true;
    toggleSelected(die);
    stage.update();

    //calculted selected die positions
    let rows = Math.floor(count / 7);
    let y = rows * 60;
    let x = (count - (rows*7)) * 60;

    //animation to new position
    createjs.Tween.get(die.container)
        .to({scale:1.2}, 200, createjs.Ease.getPowIn(2))
        .to({x:x, y:y, scale:0.5}, 500, createjs.Ease.getPowOut(2));

    //show the command buttons when selecting the first die
    showButtons();
    
}

function roll(){

    var rolled = drawDice(quantity);

    rolled.forEach((d,i) => {
        table.addChild(d.container)        
        d.container.on('rollover', ()=>rolloverout(d));
        d.container.on('rollout', ()=>rolloverout(d));
        d.container.on('click', ()=>selectDie(d));
        d.container.x = -100;
        d.container.y = -100;
        createjs.Tween.get(d.container)
            .to({x: dicePositions[i].x, y:dicePositions[i].y, rotation:360}, 400, createjs.Ease.getPowOut(2));
    })

    dice = [...dice, ...rolled];
}

function rollagain(){
    let remove = dice.filter(d=>!d.selected);
    remove.forEach(d=>table.removeChild(d.container));
    
    dice = dice.filter(d=>d.selected);

    quantity = remove.length || 6;
    showCup();
}

function doneturn() {
    dice.forEach(d =>table.removeAllChildren())
    dice = [];
}
