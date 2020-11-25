#include "TPM.jsx";

var width = 700;
var spacing = 25;
var height = 500;

var top = height;
var left = spacing;

var doc = getDoc();
var group_sun = doc.groupItems.add();

while (top >= 0) {
    left = spacing;
    while (left < width) {
        sun(doc,group_sun,top,left,7,100,"brown",100);
        left = left + spacing;
    }
    top = top - spacing;
}