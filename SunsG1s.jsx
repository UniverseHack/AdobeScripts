#include "TPM.jsx";

var sunNumber = Number(prompt("Number of Suns?","20"));
if (sunNumber) {
    var number = Number(prompt("Number of G1s?","200"));
    var color = prompt("Color of G1s?","gray");
    var width = prompt("Width?","400");
    var height = prompt("Height?","300");

    sunsRadial(sunNumber,20,400,color,2,0.4,0.1,500,width,height,10,100);    
}