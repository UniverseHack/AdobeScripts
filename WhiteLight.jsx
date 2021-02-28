#include "TPM.jsx";

var number = Number(prompt("Number of Waves","100"));
if (number > 0) {
    var color = prompt("Color?","white");
    var width = prompt("Width?","500");
    var height = prompt("Height?","500");

    var group_flow = getDoc().groupItems.add();

    for (var i = 0; i < number; i++) {
        var w = Math.random()*10 + 5;
        var h = Math.random()*60 + 10;
        var top = Math.round(Math.random() * height) + (h - height)/2;
        var left = Math.round(Math.random() * width) + (w - width)/2;
        var num = Math.random()*10;

        var subgroup = group_flow.groupItems.add();

        drawFlow(subgroup,num,color,w,h,6,260,20,top,left);
    }    
}
