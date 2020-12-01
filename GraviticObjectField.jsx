#include "TPM.jsx";

var number = Number(prompt("Number of G1s","20"));
if (number > 0) {
    var objectColor = prompt("Object Color?","gray");
    var gColor = prompt("Field Particle Color?","lightblue");
    var width = 6;
    var height = 5;
    var size = 100;
    var object = [11,14,15,16,17,23];

    var group_field = getDoc().groupItems.add();

    graviticCanvasField(group_field,number,width,height,size,object,objectColor,gColor);   
}
