#include "TPM.jsx";
var doc = getDoc();
var w = doc.width;
var h = doc.height;

var size = 6;
var num = 300;
var width = 250;
var height = 250;
var thickness = 75;

drawEllipse(doc,num,size,width,height,thickness,((w-width)/2)+(thickness/4),h/2,"white");
//drawEllipse(doc,num,size,width,height,thickness,(w+width)/2-(thickness/4),h/2,"blue");