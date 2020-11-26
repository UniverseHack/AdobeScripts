#include "TPM.jsx";

var num = 4;

var number = Number(prompt("Number of G1s","50"));
if (number > 0) {
    var color = prompt("Color?","white");
    var width = prompt("Width?","500");
    var height = prompt("Height?","6");

    var group_flow = getDoc().groupItems.add();

    for (var i = 0; i < num; i++) {
        drawFlow(group_flow,number/num,color,width,height,6,260,20,0,0);
    }    
}
