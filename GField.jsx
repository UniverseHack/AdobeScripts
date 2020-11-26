#include "TPM.jsx";

var number = Number(prompt("Number of G1s","50"));

if (number > 0) {
    var color = prompt("Color?","white");
    var width = prompt("Width?","300");
    var height = prompt("Height?","300");
    
    field(getDoc(),"g1",color,number,6,50,100,width,height);
}