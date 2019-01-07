export interface LoadResult {
    canvas: HTMLCanvasElement;
    stage: createjs.Stage;
    sprites: createjs.SpriteSheet;
    loadQueue: createjs.LoadQueue;
}

export function load(elementId: string) : Promise<LoadResult>
{
    var canvas = <HTMLCanvasElement>document.getElementById(elementId);
    var stage = new createjs.Stage(canvas);
    stage.enableMouseOver(10);
    createjs.Touch.enable(stage);
    createjs.Ticker.framerate = 60;
    createjs.Ticker.addEventListener("tick", stage);        
    
    var loadQueue = new createjs.LoadQueue();
    loadQueue.installPlugin(createjs.Sound);
 
    loadQueue.loadManifest([
        {id: "cup-sprite", src: "design/assets/dice-cup.png"},
        {id: "button-sprite", src: "design/assets/button-spritesheet.png"},
        {id: "throw-sound", src: "sounds/throw.wav"},
        {id: "shake-sound", src: "sounds/shake.wav"},
        {id: "click-sound", src: "sounds/click.mp3"},
        {id: "error-sound", src: "sounds/negative_2.wav"}
    ]);

    return new Promise((resolve,reject) => {
        loadQueue.addEventListener("complete", ()=>{
            resolve({
                sprites: loadButtonSprites(loadQueue),
                canvas: canvas,
                stage: stage,
                loadQueue: loadQueue
            });
        });
    });

}

function loadButtonSprites(queue: createjs.LoadQueue): createjs.SpriteSheet {
    return new createjs.SpriteSheet({
        images: [queue.getResult('button-sprite')],
        frames: {width: 88, height: 88},
        animations: { 
            roll_out: 0, roll_over: 1, roll_down: 2,
            pass_out: 3, pass_over: 4, pass_down: 5
        }
    });    
}

