import { GameDie } from "./dice";
import * as _ from "lodash";

export function scoreTurn(dice: GameDie[]): number {
    //group the selected dice by the die score
    var group = _(dice)
    .filter(d => d.selected)
    .groupBy(d=>d.score);

    //simple scoring of 3 (or more) of a kind
    var kindScore = group
        .filter(g => g.length >= 3)
        .sumBy(g => {
            return _.sumBy(g, i => i.score * 100);
        });

    //simple scoring of single dice
    var singleScore = group
        .filter(g => g.length <= 2)
        .sumBy(g => {
            return _.sumBy(g, i => {
                switch(i.score) {
                    case 1: return 100;
                    case 5: return 50;
                    default: return 0;
                }
            });
        });

    return kindScore + singleScore;
}
