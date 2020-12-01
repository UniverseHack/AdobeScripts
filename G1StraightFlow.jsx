#include "TPM.jsx";
var doc = getDoc();

var number = 250;
var width = 75;
var height = 550;
var w = doc.width;
var h = doc.height;
var size = 6;

for (var i = 0; i < number; i++) {
    top = Math.round(Math.random() * height) + (h - height)/2;
    left = Math.round(Math.random() * width) + (w - width)/2;
    angle = Math.round(Math.random() * 18) - 8;
    scale = 70 + Math.round(Math.random() * 30);

    //g1(doc,top,left,angle,scale,"white");
    g1(doc,top,left,size,angle,scale,"white",0);
}