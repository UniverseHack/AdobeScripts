#include "TPM.jsx";

var number = Number(prompt("Number of path lines","10"));
if (number > 0) {
    var objectColor = prompt("Object Color?","gray");
    var impactColor = prompt("Impact Particle Color?","lightblue");
    var passColor = prompt("Passthru Particle Color?","red");
    var width = 30;
    var height = 15;
    var size = 20;
    var spacing = 20;
    var reduction = 2;
    var gridText = false;
    var canvasOnly = false;
    var drawLines = false;
    var object = [
            133,134,135,136,
        162,163,164,165,166,167,
        192,193,194,195,196,197,
        222,223,224,225,226,227,
        252,253,254,255,256,257,
            283,284,285,286
    ];

    var group_field = getDoc().groupItems.add();

    graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly,drawLines);   
}