/// <reference path="../node_modules/@types/easeljs/index.d.ts" />
import { GameDie, drawDice, toggleSelected } from './dice';
import { getIntroText, getScoreText } from './text';
import { dicePositions, selectedPositions } from './layout';
import { load, LoadResult } from './loader';
import { scoreTurn, validateTurn } from './score';
import { setTurnScore, setupGameBoard, showButtons, showCup, setGameScore, showBustMessage, fallingDice, resetTurnScore } from './interface';

var canvas: HTMLCanvasElement;
var stage: createjs.Stage;
var table: createjs.Container;
var quantity = 6;
var scoreText: createjs.Text;
var gameScore: number = 0;
var turnScore: number = 0;
var busted = false;
var rolling = false;
var thrownDice: GameDie[] = [];
var selectedDice: GameDie[] = [];
var turnDice: GameDie[][] = [[]];
var selectedCount: number = 0;

//load and run
window.onload = () => load('game-canvas').then(setup);


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
            rolling = true;
            showCup();
        });
    });

    stage.update();
}

function rolloverout(die: GameDie){
    if (!busted && !die.selected && !rolling) toggleSelected(die);
    stage.update();
}

function roll(){
    busted = false;
    rolling = false;
    thrownDice = drawDice(quantity);

    thrownDice.forEach(d => {
        table.addChild(d.container)        
        d.container.on('rollover', ()=>rolloverout(d));
        d.container.on('rollout', ()=>rolloverout(d));
        d.container.on('click', ()=>selectDie(d));
        d.container.x = -100;
        d.container.y = -100;
        createjs.Tween.get(d.container)
            .to({
                    x: dicePositions[d.index].x, 
                    y:dicePositions[d.index].y, 
                    rotation:360
                }, 400, createjs.Ease.getPowOut(2));
    })
    
    //if the user can't score this roll then they busted!
    if (scoreTurn(thrownDice) === 0) {
        showBusted();
    } else {
        showButtons();
    }
}

function showBusted(){
    selectedCount = 0;
    turnScore = 0;
    busted = true;
    setTurnScore(0);

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
    if (busted || rolling) return;

    //calculate the current score before this die
    var currentScore = scoreTurn(selectedDice);

    toggleSelected(die);
    stage.update();

    //count the number of existing selected dice
    if (die.selected) {
        selectedCount--;

        //remove the selected die from the array of thrown dice
        selectedDice = selectedDice.filter(d => d !== die);

        //add dice to thrown array
        thrownDice = [...thrownDice, die];

        //animate return to old position
        createjs.Tween.get(die.container)
            .to({
                x:dicePositions[die.index].x,
                y:dicePositions[die.index].y,
                scale:1
            }, 500, createjs.Ease.getPowOut(2));

    } else {
        selectedCount++;

        //remove the selected die from the array of thrown dice
        thrownDice = thrownDice.filter(d => d !== die);

        //add dice to selected array
        selectedDice = [...selectedDice, die];

        //animation to the "selected" position
        let {x, y} = selectedPositions(selectedCount-1);
        createjs.Tween.get(die.container)
            .to({scale:1.2}, 200, createjs.Ease.getPowIn(2))
            .to({x:x, y:y, scale:0.5}, 500, createjs.Ease.getPowOut(2));
    }

    die.selected = !die.selected;

    //show the command buttons when selecting the first die
    showButtons();

    //selected dice are dice selected this rounde
    let newScore = scoreTurn(selectedDice);

    //only show the score animation changing when the number has changbed
    if (currentScore !== newScore) {
        setTurnScore(turnScore + newScore);
    }
}

function rollagain() {

    if (!validateTurn(selectedDice)) {
        createjs.Sound.play("error-sound");
        return;
    }

    createjs.Sound.play("click-sound");

    //the correct number of dice to throw next turn
    quantity = thrownDice.length || 6;

    //mark the selected dice as scored for this turn
    selectedDice.forEach(d=>d.scored = true);

    //cleanup the thrown dice
    fallingDice(thrownDice).then( () => {

        //increment the turn score
        turnScore += scoreTurn(selectedDice);

        //add to the turn dice
        turnDice = [...turnDice, selectedDice];

        //cleanup 
        thrownDice = [];
        selectedDice = [];

        //show the cup to start a new roll
        rolling = true;
        showCup(); 
    });

}

function doneturn() {

    if (!validateTurn(selectedDice)) {
        createjs.Sound.play("error-sound");
        return;
    }

    createjs.Sound.play("click-sound");

    quantity = 6;

    //mark the selected dice as scored for this turn
    selectedDice.forEach(d=>d.scored = true);

    
    fallingDice([
            ...thrownDice, 
            ...selectedDice, 
            ...turnDice.reduce((a,b) => a.concat(b))
        ]).then( () => {

            //increment the turn score
            turnScore += scoreTurn(selectedDice);
            gameScore += turnScore; //scoreTurn(selectedDice);
            setGameScore(gameScore);
            resetTurnScore();

            //cleanup
            thrownDice = [];
            selectedDice = [];
            turnDice = [[]];
            selectedCount = 0;
            turnScore = 0;

            //roll again
            rolling = true;
            showCup(); 
        });
 }
