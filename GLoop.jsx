#include "TPM.jsx";

var doc = getDoc();
var w = doc.width;
var h = doc.height;

var size = 6;
var thickness = 75;

var number = Number(prompt("Number of G1s","200"));
if (number > 0) {
    var color = prompt("Color?","white");
    var width = prompt("Width?","250");
    var height = prompt("Height?","250");

    drawEllipse(doc,number,size,width,height,thickness,((w-width)/2)+(thickness/4),h/2,color);    
}
