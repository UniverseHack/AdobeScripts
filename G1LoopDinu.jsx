#include "TPM.jsx";

var doc = getDoc();
var w = doc.width;
var h = doc.height;

var size = 5;
var num = 1000;
var width = 350;
var height = 350;
var thickness = 300;

drawEllipse(doc,num,size,width,height,thickness,((w-width)/2)+(thickness/4),h/2,"lightblue");
drawEllipse(doc,num,size,width,height,thickness,(w+width)/2-(thickness/4),h/2,"white");