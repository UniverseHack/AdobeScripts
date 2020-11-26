#include "TPM.jsx";

var width = 700;
var spacing = 35;
var height = 250;

var top = height;
var left = spacing;

var doc = getDoc();
var group_sun = doc.groupItems.add();

var shift = spacing / 4;

while (top >= 0) {
    shift = shift * -1;
    left = spacing + shift;
    while (left < width) {
        sun(group_sun,top,left,7,100,"brown",100);
        left = left + spacing;
    }
    top = top - spacing;
}