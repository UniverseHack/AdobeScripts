#include "TPM.jsx";

var min = 10;
var max = 60;
var width = 600;
var height = 500;
var number = 200;
var color = 'blue';

var lines = getDoc().groupItems.add();

for (var i = 0; i < number; i++) {
    var len = Math.random() * (max - min) + min;
    var x = Math.random() * width;
    var y = Math.random() * height;
    var colorint = Math.random() * 30;
    var thickness = Math.random() * 10 + 3;
    if (colorint < 10) color = 'blue';
    if (colorint >= 10 && colorint < 20) color = 'green';
    if (colorint >= 20 && colorint < 30) color = 'red';
    addLine(lines,x,y,x+len,y,thickness,color);
}