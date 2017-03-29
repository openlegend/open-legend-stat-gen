var Radio = 0;
var DiceBox = 0;

function singleRoll(die) {
    // Roll a single exploding die of size die
    // Called by Dice
    // returns a single value
    var roll = 0;
    var value = 0;
    if (die < 2) { return 1; }
    // else
    do { value += roll = Math.floor(Math.random() * die) + 1; } while (roll == die);
    return value;
}

function Dice(die, count) {
    // Roll count D die
    // Called by Roll
    // returns an array
    var total = [];
    for (var i = 0; i < count; i++) { total.push(singleRoll(die)); }
    return total;
}

function Roll(die,count,advantage)
        // Roll countDdie with an advantage/disadvantage
        // advanatge: 0 - none, >0 advantage, < 0 disadvantahe
{
     // sanitize
     die=Math.floor(Number(die));
     count=Math.floor(Number(count));
     advantage=Math.floor(Number(advantage));
     // do the roll
     if (advantage > 0)      { return Sum(Dice(die, count+advantage).sort(function(a, b) { return b - a; }).slice(0, count)); }
     else if (advantage < 0) { return Sum(Dice(die, count+(-1*advantage)).sort(function(a, b) { return a - b; }).slice(0, count)); }
     return Sum(Dice(die, count));
}

function Sum(aIn) {
// Sum an array
var total = 0;
for (var i in aIn) { total += aIn[i]; }
return total }

function buildDice()
{
// Structure used for DiceBox
   var dice = [];
   for (var j = 0; j < DiceBox; j++) {
        dice.push([Number($('#die' + j).val())||0,
                   Number($('#num' + j).val())||0,
                   Number($('input[name=ad' + j + ']:checked').val()) || 0,
                   Number($('#adv' + j).val()) || 0 ]);
        // Just a stat
    }
   return dice;
}


function clearDice() {
        // Clears the DiceBox in the html
        // Re-adds a 1D20 no advantage
    $('#dicebox').slideUp("fast", function() { $('#dicebox').empty().show(); DiceBox = 0; addDie(20, 1); })
    $("#out").fadeOut("slow");
}

function addDie(dice, count) {
        // add a new dice group to the DiceBox .... an html thing.. if called without arguments use 2D6
    dice = Number(dice) || 6;
    cound = Number(count) || 2;
    $('#dicebox').append(
        "<div style='display: none; margin-bottom: 5px;' id='roll" + DiceBox + "'>" +
        "<div class='smallc'><input name='num" + DiceBox + "' id='num" + DiceBox + "' type='text' class='small' value='" + count + "' />D</div>" +
        "<div class='smallc'><input name='die" + DiceBox + "' id='die" + DiceBox + "' type='text' class='small' value='" + dice + "' /> with&nbsp; </div>" +
        "<div class='smallc'><input type='text' id='adv" + DiceBox + "' name='adv" + DiceBox + "' value='1' class='small'> Dice of </div>" +
        "<div class='boxme'><input type='radio' name='ad" + DiceBox + "' value='0' checked>None</div>" +
        "<div class='boxme'><input type='radio' name='ad" + DiceBox + "' value='1'>Advantage</div>" +
        "<div class='boxme'><input type='radio' name='ad" + DiceBox + "' value='-1'>Disadvantage</div>" +
        "<div class='clear'>&nbsp;</div>" +
        "</div>");
    $("#roll" + DiceBox).slideDown("slow");
    $("#out").fadeOut("slow");
    DiceBox++;
}

function totals(dice, rep, divout) {
    // Cleans the Out box..... and runs the first iterator
    $("#out").fadeOut("fast",function (){totals_iter(dice,rep,divout)});
}
function totals_iter(dice,rep,divout) {
        // Puts a "Working" message up and runs the next iterator
        $("#out").html("<H2>Working....</H2><div class='clear'>&nbsp;</div>").fadeIn("fast",
                        function (){totals_iter2(dice,rep,divout); });
}

function totals_iter2(dice,rep,divout)
        // dice - The array of arrays - dicebag
        // rep - scalar - repitition count
        // divout - The jquery object for the output div
{
    var dieTotal = 0; // count how many dice
    var colate = [];  // where I am keeping rolled dice data

    // collect dice data to speed up things later
    for (var j in dice) {
        // Just a stat
        dieTotal += dice[j][1];
    }

    for (var i = 0; i < rep; i++) {
            // for each count....
        var numIn = 0;
        for (var j = 0; j < DiceBox; j++) {
                // for each Dice grouping in the DiceBox
                numIn +=Roll(dice[j][0],dice[j][1],dice[j][2]*dice[j][3]);
            }
        // Check for a number and fill an array
        colate[numIn] = (colate[numIn] + 1) || 1;
    }

    var rollTotal = 0;  // big total of all rolls

    // Colate may be sparse ... fix remaining NaN and do total
    for (var i=0; i< colate.length; i++) {
        colate[i] = colate[i] || 0;
        rollTotal += colate[i] * i;
    }

    // Put in th "header" stuff in the output
    var mymax = Math.max.apply(null, colate);
    var out = "<div class='contain'><span class='what'>Expected Value:</span> " + Math.round(100.0 * rollTotal / rep) / 100.0;
    out += "</div><div class='contain'><span class='what'>Dice Rolled:</span><br />";
    for (var i in dice) {
        if (dice[i][2] == 0) {
            // no advantage
            out += dice[i][1] + "D" + dice[i][0] + "<br />";
        } else {
            out += (dice[i][1] + dice[i][3]) + "D" + dice[i][0] +
                    " with " + ((dice[i][2] > 0) ? "top " : "bottom ") + dice[i][1] + "D" + dice[i][0] + " being summed<br />";
        }
    }
    // And the big table to results

    out +=
        "</div><div class='clear'>&nbsp;</div><table><tr><td class='myth'>Roll</td><td class='myth'>Percent</td><td class='myth'>At Least</td></tr>";
    var tt = 1; // total total.... chance of that roll or lower
    for (var i = dieTotal; i < colate.length; i++) {
        out +=
            "<tr><td class='mytd"+i%3+"'>" + i + "</td><td class='mytd"+i%3+"'>" +
            +Math.round(10000.0 * (colate[i] || 0) / rep) / 100 + "%</td><td class='mytd"+i%3+"'>" + Math.round(10000.0 * tt) / 100.0 + "%</td>" +
            "<td>" + colate[i] + "</td>" +
            "<td>" + (colate[i] ?
                "<div class='filled' style='width:" +
                Math.round(700.0 * (colate[i] || 0) / mymax) + "'>&nbsp;</div>" : "&nbsp;") +
            "</td></tr>";
        tt -= (colate[i] / rep);
    }
    out += "</table>"
            // put it on the screen
    divout.fadeOut("fast",function (){ divout.html(out).fadeIn("fast"); });
}
