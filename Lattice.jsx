#include "TPM.jsx";

var doc = getDoc();
var group_lattice = getDoc().groupItems.add();

var color = prompt("Color?","yellow");

var x1 = 75;
var x2 = 650;
for (var i = 0; i < 7; i++) {
    sunLinePerspective(group_lattice,9,30,x1,150,x2,700,color,40);
    x1 = x1 + 100;
    x2 = x2 - 100;
}

var x1 = 75;
var x2 = 650;
for (var i = 0; i < 7; i++) {
    sunLinePerspective(group_lattice,9,30,x1,250,x2,600,color,100);
    x1 = x1 + 100;
    x2 = x2 - 100;
}