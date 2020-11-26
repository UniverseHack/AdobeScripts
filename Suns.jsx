#include "TPM.jsx";

var number = Number(prompt("Number of Suns","200"));
var color = prompt("Color?","yellow");
var width = prompt("Width?","600");
var height = prompt("Height?","500");

field(getDoc(),"sun",color,number,15,30,100,width,height);