import { LoadResult } from './loader';
import { getScoreText, getScoreTextSmall, getBustText } from './text';
import { GameDie } from './dice';

var shakeSound: createjs.AbstractSoundInstance;
var table: createjs.Container;
var cupSprite: createjs.Bitmap;
var rollButton: createjs.Sprite;
var doneButton: createjs.Sprite;
var scoreLarge: createjs.Text;
var scoreSmall: createjs.Text;
var scoreTemp: createjs.Text;
var bustText: createjs.Text;

export function resetTurnScore()
{
    scoreSmall.y = 44;
    scoreSmall.alpha = 1;
    scoreSmall.text = "---";
}

export function setTurnScore(score: number){
    scoreTemp.y = 400;
    scoreTemp.text = score.toString();

    scoreSmall.y = 44;
    scoreSmall.alpha = 1;

    createjs.Tween.get(scoreTemp)
        .to({y:250, scale:1.7, alpha:1}, 400, createjs.Ease.getPowIn(2))
        .to({y:44, scale:1.2, alpha:0}, 400, createjs.Ease.getPowOut(2));

    createjs.Tween.get(scoreSmall)
        .wait(600)
        .to({alpha:0, scale:1.5}, 200)
        .call(() => {
            scoreSmall.text = score.toString();
        })
        .to({alpha:1, scale: 1.1}, 200)
        .to({scale:1}, 200);
}

export function showBustMessage(): Promise<createjs.Text> {
    return new Promise((resolve,reject) => {
        createjs.Tween.get(bustText)
        .to({alpha:1, scale:1.5}, 200, createjs.Ease.getPowIn(4))
        .to({scale:1}, 300, createjs.Ease.getPowIn(4))
        .call(() => resolve(bustText));
    });
}

export function setGameScore(score: number){
    if (score <= 0) return;

    createjs.Tween.get(scoreSmall)
        .to({y:0, alpha:0}, 300);
    
    createjs.Tween.get(scoreLarge)
        .to({scale:1.3}, 150)
        .call(()=>{
            scoreLarge.text = score.toString();
        })
        .to({scale:1}, 150);
}

export function setTotalScore(score: number){
    scoreSmall.text = score.toString();
}

export function setupScoreboard(): createjs.Container
{
    var scoreBoard = new createjs.Container();
    var g = new createjs.Graphics();
    g.setStrokeStyle(3);
    g.beginStroke("#FFC602");
    g.beginFill('#A17D00');
    g.drawCircle(0,0,80);
    var shape = new createjs.Shape(g);
    shape.shadow = new createjs.Shadow("#333333",5,5,10);
    scoreBoard.addChild(shape);
    scoreLarge = getScoreText();
    scoreSmall = getScoreTextSmall();
    scoreBoard.addChild(scoreLarge);
    scoreBoard.addChild(scoreSmall);

    scoreTemp = new createjs.Text("100", "bold 24px Arial", "#ffffff");
    scoreTemp.maxWidth = 640;
    scoreTemp.textAlign = "center";
    scoreTemp.shadow = new createjs.Shadow("#000000", 5, 5, 10);
    scoreTemp.textBaseline = "middle";
    scoreTemp.alpha = 0;
    scoreBoard.addChild(scoreTemp).set({y: 400});

    return scoreBoard;
}

export function showButtons(){
    if (rollButton.alpha === 1 && doneButton.alpha === 1) return;

    createjs.Tween.get(rollButton).to({alpha:1}, 400);
    createjs.Tween.get(doneButton).to({alpha:1}, 400);
}

export function showCup(){
    createjs.Tween.get(rollButton).to({alpha:0}, 400);
    createjs.Tween.get(doneButton).to({alpha:0}, 400);

    cupSprite.x = 320;
    cupSprite.y = 300;
    cupSprite.rotation = 0;
    cupSprite.visible = true;
}

export function fallingDice(dice: GameDie[]): Promise<void> {

    return new Promise( (resolve, reject) => {

        //animate the remaining dice off the screen and remove with a timeline
        var tl = new createjs.Timeline({
            onComplete:()=>{
                dice.forEach(d =>table.removeChild(d.container));
                dice = [];
                resolve();
            }
        });

        dice.forEach( (d,i) => {
            let t = createjs.Tween.get(d.container)
                .wait(i * 80)
                .to({y: 800, rotation: 180}, 600);

            tl.addTween(t);
        });    
    });
}

export function setupGameBoard(loaded: LoadResult, roll: Function, done: Function, shake: Function): createjs.Container
{
    let stage = loaded.stage;
    let spriteSheet = loaded.sprites;
    let loadQueue = loaded.loadQueue;

    table = new createjs.Container();
    table.x = 160;
    table.y = 140;
    stage.addChild(table);

    stage.addChild(setupScoreboard()).set({x:350});

    bustText = getBustText(360,245);
    stage.addChild(bustText).set({alpha:0});

    rollButton = new createjs.Sprite(spriteSheet, 'roll_out');
    stage.addChild(rollButton).set({x: 20, y: 470, alpha:0});
    var bitmapHelper = new createjs.ButtonHelper(rollButton, 'roll_out', 'roll_over', 'roll_down');    
    rollButton.addEventListener('click', () => {
        createjs.Sound.play("click-sound");
        roll();
    });

    doneButton = new createjs.Sprite(spriteSheet, 'pass_out');
    stage.addChild(doneButton).set({x: 610, y: 470, alpha:0});
    var bitmapHelper2 = new createjs.ButtonHelper(doneButton, 'pass_out', 'pass_over', 'pass_down');    
    doneButton.addEventListener('click', () => {
        createjs.Sound.play("click-sound");
        done();
    });

    cupSprite = new createjs.Bitmap(loadQueue.getResult('cup-sprite'));
    cupSprite.shadow = new createjs.Shadow("#000", 2,2,20);
    cupSprite.regX = 90;
    cupSprite.regY = 75;
    cupSprite.x = 320;
    cupSprite.y = 200;
    cupSprite.visible = false;
    stage.addChild(cupSprite);

    var angle = 0;
    cupSprite.on('rollover', function(evt: createjs.MouseEvent){
        createjs.Tween.get(evt.target).to({scale:1.075}, 67);
    });
    cupSprite.on('rollout', function(evt: createjs.MouseEvent) {
        if (evt.nativeEvent.buttons == 0)
            createjs.Tween.get(evt.target).to({scale:1}, 67);
    }); 
    cupSprite.on("pressmove", function(evt: createjs.MouseEvent) {
        if (evt.stageX > evt.target.x && angle < 50) {
            angle +=  ((evt.stageX - evt.target.x) / 15);
        }else if (evt.stageX < evt.target.x && angle > -50) {
            angle -=  ((evt.target.x - evt.stageX) / 15);
        }

        createjs.Tween.get(evt.target).to({x:evt.stageX + (angle / 2), rotation: angle}, 100);

        if (shakeSound == null)
            shakeSound = createjs.Sound.play('shake-sound', {loop: 100});
    
    });

    cupSprite.on('pressup', function(evt: createjs.MouseEvent) {
        createjs.Tween.get(evt.target)
            .to({x: -200, y: -200, rotation: 140}, 600)
            .call(()=>{
                if (shakeSound != null) shakeSound.stop();
                createjs.Sound.play('throw-sound', {delay:100});
                shake();
            });
    }); 


    return table;
}

