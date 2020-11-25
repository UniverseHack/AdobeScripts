#include "TPM.jsx";

var group_waves = getDoc().groupItems.add();
var waveCount = Number(prompt("How many color waves?","15"));

for (var i = 0; i < waveCount + 1; i++) {

    var color = "white";
    var g1Number = 20;
    var spacing = 40;

    var factor = 9;
    var num = Math.floor(1 + Math.random() * 3);

    if (num == 1) {
        color = "red";
        g1Number = 10;
        spacing = 90;
        number = 5;
    }
    else if (num == 2) {
        color = "green";
        g1Number = 15;
        spacing = 65;
        number = 7;
    }
    else if (num == 3) {
        color = "blue";
        g1Number = 20;
        spacing = 40;
        number = 10;
    }

    var x = Math.random() * 700;
    var y = Math.random() * 500;

    drawWave(group_waves,number,x,y,g1Number,spacing,color);
}
