#include "TPM.jsx";

var number = Number(prompt("Number of path lines","10"));
if (number > 0) {
    var objectColor = prompt("Object Color?","lightblue");
    var impactColor = prompt("Impact Particle Color?","gray");
    var passColor = prompt("Passthru Particle Color?","black");
    var width = 30;
    var height = 15;
    var size = 20;
    var spacing = 20;
    var reduction = 2;
    var gridText = false;
    var canvasOnly = false;
    var drawLines = false;
    var object = [
            129,130,131,132,
        158,159,160,161,162,163,
        188,189,190,191,192,193,        202,203,
        218,219,220,221,222,223,        232,233,
        248,249,250,251,252,253,
            279,280,281,282
    ];

    var group_field = getDoc().groupItems.add();

    graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly,drawLines);   
}