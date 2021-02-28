#include "TPM.jsx";

var number = Number(prompt("Number of path lines","1000"));
if (number > 0) {
    var objectColor = prompt("Object Color?","gray");
    var impactColor = prompt("Impact Particle Color?","lightblue");
    var passColor = prompt("Passthru Particle Color?","black");
    var width = 16;
    var height = 12;
    var size = 40;
    var spacing = 20;
    var reduction = 2;
    var gridText = false;
    var canvasOnly = false;
    var drawLines = false;
    var object = [
        -81,86,     -91,96,
        -97,102,    -107,112
    ];
    var group_field = getDoc().groupItems.add();
    group_field.name = "Apple Field";

    graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly,drawLines);   
}