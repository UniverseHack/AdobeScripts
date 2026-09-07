#include "TPM.jsx";

var number = Number(prompt("Number of G1s","50"));

if (number > 0) {
    var color = prompt("Color?","white");
    var width = prompt("Width?","300");
    var height = prompt("Height?","300");
    var particleWidth = prompt("Particle width?","6");
    
    // field(doc, name, color, count, particleWidth, spacing, density, width, height)
    field(getDoc(),"g1",color,number,particleWidth,50,100,width,height);
}