export function introText(): createjs.Text
{
    var msg = new createjs.Text("Click to Start!", "bold 24px Arial", "#ffffff");
	msg.maxWidth = 640;
    msg.textAlign = "center";
    msg.shadow = new createjs.Shadow("#000000", 5, 5, 10);
	msg.textBaseline = "middle";
    return msg;
}