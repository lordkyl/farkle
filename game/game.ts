/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';
import { getIntroText, getScoreText } from './text';
import { dicePositions } from './layout';
import { load, LoadResult } from './loader';
import { scoreTurn } from './score';
import { setTurnScore, setupGameBoard, showButtons, showCup, setGameScore, showBustMessage } from './interface';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;
var table: createjs.Container;
var quantity = 6;
var scoreText: createjs.Text;
var gameScore: number = 0;
var turnScore: number = 0;
var busted = false;

//load and run
window.onload = () => load('game-canvas').then(setup);

var dice: GameDie[] = [];

function setup(loaded: LoadResult){
    canvas = loaded.canvas;
    stage = loaded.stage;
    table = setupGameBoard(loaded, rollagain, doneturn, roll);
    intro();
}

function intro(){
    var msg = getIntroText(canvas.width / 2, canvas.height / 2);
    stage.addChild(msg);

    scoreText = getScoreText();
    stage.addChild(scoreText).set({visible:false});

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
    if (!busted)
        toggleSelected(die);
    stage.update();
}

function roll(){
    busted = false;
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

    //if the user can't score this roll then they busted!
    if (scoreTurn(rolled) === 0) showBusted();
}

function showBusted(){
    turnScore = 0;
    busted = true;
    showBustMessage().then((text)=>{
        var startEvent = stage.on('stagemouseup', () => {

            //clean up bust text and event handler
            createjs.Tween.get(text)
            .to({alpha:0}, 300, createjs.Ease.getPowOut(2))
            .call(() => {
                stage.off('stagemouseup', startEvent);
            });

            //cleanup
            doneturn();
        });
    });

}


function selectDie(die: GameDie){
    //count the number of existing selected dice
    let count = dice.filter(d=>d.selected || d.scored).length;

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

    turnScore = scoreTurn(dice);
    setTurnScore(turnScore);
}

function rollagain(){
    //the dice not selected are discarded and re-rolled
    let discard = dice.filter(d => !d.selected);

    //cleanup the interface
    discard.forEach(d=>table.removeChild(d.container));

    //remove the dice from the array
    dice = dice.filter(d=>d.selected).map(d => {
        return {
            ...d,
            selected: false,
            scored: true
        };
    });

    //set this variable to roll the correct number of dice
    quantity = discard.length || 6;

    //show the rolling interface
    showCup();
}

function doneturn() {
    if (turnScore > 0) {
        gameScore += turnScore;
        setGameScore(gameScore);
    }

    //animate the remaining dice off the screen and remove with a timeline
    var tl = new createjs.Timeline({
        onComplete:()=>dice.forEach(d =>table.removeAllChildren())
    });

    dice.forEach( (d,i) => {
        let t = createjs.Tween.get(d.container)
            .wait(i * 80)
            .to({y: 800, rotation: 180}, 600);

        tl.addTween(t);
    });


    //empty array
    dice = [];
}
