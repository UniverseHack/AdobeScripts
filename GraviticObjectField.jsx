#include "TPM.jsx";

var number = Number(prompt("Number of path lines","10"));
if (number > 0) {
    var objectColor = prompt("Object Color?","gray");
    var impactColor = prompt("Impact Particle Color?","lightblue");
    var passColor = prompt("Passthru Particle Color?","red");
    var width = 15;
    var height = 11;
    var size = 50;
    var spacing = 20;
    var reduction = 0;
    var gridText = false;
    var canvasOnly = false;
    var object = [11,26,41,56,71,76,77,78,79,80,81,82,83,84,85,86,101,116,131,146,161];

    var group_field = getDoc().groupItems.add();

    graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly);   
}
