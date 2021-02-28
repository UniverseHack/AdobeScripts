#include "TPM.jsx";

var number = Number(prompt("Number of path lines","1000"));
if (number > 0) {
    var objectColor = prompt("Object Color?","green");
    var impactColor = prompt("Impact Particle Color?","lightblue");
    var passColor = prompt("Passthru Particle Color?","black");
    var width = 30;
    var height = 18;
    var size = 20;
    var spacing = 20;
    var reduction = 2;
    var gridText = false;
    var canvasOnly = false;
    var drawLines = false;
    var object = [
         195,-271,540
    ];
    var group_field = getDoc().groupItems.add();
    group_field.name = "Apple Field";

    graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly,drawLines);   
}