#include "TPM.jsx";

var x = 100;
var y = 100;

var total = Number(prompt("Total number of luminic waves?","1"));

if (total > 0) {
    var number = Number(prompt("How many waves in one luminic wave?","6"));
    var g1Number = Number(prompt("Number of G1s per wave","10"));
    var spacing = Number(prompt("Spacing","80"));
    var color = prompt("Color?","red");
    
    for (var i = 0; i < total; i++) {
        var group_waves = getDoc().groupItems.add();
        drawWave(group_waves,number,x,y,g1Number,spacing,color);
        group_waves.rotate(270);    
    }


}
