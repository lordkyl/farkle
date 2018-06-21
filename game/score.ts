import { GameDie } from "./dice";
import * as _ from "lodash";

export function scoreTurn(dice: GameDie[]): number {
    //group the selected dice by the die score
    var group = _(dice).groupBy(d=>d.score);

    //simple scoring of 3 (or more) of a kind
    var kindScore = group
        .filter(g => g.length >= 3)
        .sumBy(g => {
            
            let count = g.length;
            let value = g[0].score;

            switch(value) {
                case 1: return (count-3) * 1000 + 1000;
                default: return (count-3) * 100 + (value * 100);
            }
        });

    //simple scoring of single dice
    let singles = group
        .filter(g => g.length <= 2)
        .reduce((a,b) => a.concat(b));

    let singleScore = _.sumBy(singles, d => {
        switch(d.score) {
            case 1: return 100;
            case 5: return 50;
            default: return 0;
        }
    });

    return kindScore + singleScore;
}
