/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';
import { introText } from './text';
import { dicePositions } from './layout';
import { load, LoadResult } from './loader';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;
var spriteSheet: createjs.SpriteSheet;
var loadQueue: createjs.LoadQueue;

//load and run
window.onload = () => load('game-canvas').then(setup);

var shakeSound: createjs.AbstractSoundInstance;
var rollSound: createjs.AbstractSoundInstance;
var dice: GameDie[] = [];
var selected = () => dice.filter(d=>d.selected);
var table: createjs.Container = null;
var ui = {
    buttons: {
        roll: null,
        score: null
    }
};

function setup(loaded: LoadResult){
    canvas = loaded.canvas;
    stage = loaded.stage;
    spriteSheet = loaded.sprites;
    loadQueue = loaded.loadQueue;
    intro();
}


function intro(){
    var msg = introText();
	msg.x = canvas.width / 2;
    msg.y = canvas.height / 2;
    stage.addChild(msg);

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
            myturn();
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
    if (count === 0) {
        createjs.Tween.get(ui.buttons.roll).to({alpha:1}, 400);
        createjs.Tween.get(ui.buttons.score).to({alpha:1}, 400);
    }
    
}

function roll(quantity: number = 6){
    if (table === null) setupGameBoard();

    if (shakeSound) shakeSound.stop();
    rollSound = createjs.Sound.play('throw-sound', {delay:100});

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
    roll(remove.length || 6);
}

function doneturn() {
    dice.forEach(d =>table.removeAllChildren())
    dice = [];
}


function setupGameBoard(){

    if (table === null) {
        table = new createjs.Container();
        table.x = 160;
        table.y = 40;
        stage.addChild(table);
    } 

    if (ui.buttons.roll === null) {
        ui.buttons.roll = new createjs.Sprite(spriteSheet, 'roll_out');
        stage.addChild(ui.buttons.roll).set({x: 20, y: 370, alpha:0});
        var bitmapHelper = new createjs.ButtonHelper(ui.buttons.roll, 'roll_out', 'roll_over', 'roll_down');    
        ui.buttons.roll.addEventListener('click', () => {
            createjs.Sound.play("click-sound");
            rollagain();
        });
    
        ui.buttons.score = new createjs.Sprite(spriteSheet, 'pass_out');
        stage.addChild(ui.buttons.score).set({x: 610, y: 370, alpha:0});
        var bitmapHelper2 = new createjs.ButtonHelper(ui.buttons.score, 'pass_out', 'pass_over', 'pass_down');    
        ui.buttons.score.addEventListener('click', () => {
            createjs.Sound.play("click-sound");
            doneturn();
        });
    }
}



function myturn(){
    stage.removeAllChildren();

    var bitmap = new createjs.Bitmap(loadQueue.getResult('cup-sprite'));
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

        if (shakeSound == null)
            shakeSound = createjs.Sound.play('shake-sound', {loop: 100});
    
    });

    bitmap.on('pressup', function(evt: createjs.MouseEvent) {
        createjs.Tween.get(evt.target)
            .to({x: -200, y: -200, rotation: 140}, 600)
            .call(()=>roll());
    }); 

}

