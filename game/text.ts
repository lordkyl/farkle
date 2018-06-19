export function getIntroText(): createjs.Text
{
    var msg = new createjs.Text("Click to Start!", "bold 24px Arial", "#ffffff");
	msg.maxWidth = 640;
    msg.textAlign = "center";
    msg.shadow = new createjs.Shadow("#000000", 5, 5, 10);
	msg.textBaseline = "middle";
    return msg;
}

export function getScoreText(): createjs.Text {
    var msg = new createjs.Text("SCORE", "bold 32px Arial", "#ffffff");
    msg.x = 0;
    msg.y = 8;
    msg.maxWidth = 80;
    msg.textAlign = "center";
    msg.shadow = new createjs.Shadow("#000000", 1, 1, 1);
    return msg;
}

export function getScoreTextSmall(): createjs.Text {
    var msg = new createjs.Text("score", "bold 18px Arial", "#ffffff");
    msg.x = 0;
    msg.y = 44;
    msg.maxWidth = 80;
    msg.textAlign = "center";
    msg.shadow = new createjs.Shadow("#000000", 1, 1, 1);
    return msg;
}