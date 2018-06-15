import { LoadResult } from './loader';

var shakeSound: createjs.AbstractSoundInstance;
var table: createjs.Container;
var cupSprite: createjs.Bitmap;
var rollButton: createjs.Sprite;
var doneButton: createjs.Sprite;

export function showButtons(){
    if (rollButton.alpha === 1 && doneButton.alpha === 1) return;
    
    createjs.Tween.get(rollButton).to({alpha:1}, 400);
    createjs.Tween.get(doneButton).to({alpha:1}, 400);
}

export function showCup(){
    createjs.Tween.get(rollButton).to({alpha:0}, 400);
    createjs.Tween.get(doneButton).to({alpha:0}, 400);

    cupSprite.x = 320;
    cupSprite.y = 200;
    cupSprite.rotation = 0;
    cupSprite.visible = true;
}

export function setupGameBoard(loaded: LoadResult, roll: Function, done: Function, shake: Function): createjs.Container
{
    let stage = loaded.stage;
    let spriteSheet = loaded.sprites;
    let loadQueue = loaded.loadQueue;

    table = new createjs.Container();
    table.x = 160;
    table.y = 40;
    stage.addChild(table);

    rollButton = new createjs.Sprite(spriteSheet, 'roll_out');
    stage.addChild(rollButton).set({x: 20, y: 370, alpha:0});
    var bitmapHelper = new createjs.ButtonHelper(rollButton, 'roll_out', 'roll_over', 'roll_down');    
    rollButton.addEventListener('click', () => {
        createjs.Sound.play("click-sound");
        roll();
    });

    doneButton = new createjs.Sprite(spriteSheet, 'pass_out');
    stage.addChild(doneButton).set({x: 610, y: 370, alpha:0});
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

