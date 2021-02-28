#include "TPM.jsx";

var num = Number(prompt("Number of Gs","150"));
if (num > 0) {
    var color = prompt("Color","white");
    var width = prompt("Width","100");
    var height = prompt("Height","300");
    var thickness = prompt("Thickness","300");

    doc = getDoc();
    var w = doc.width;
    var h = doc.height;
    var size = 4.5;

    var group_field = doc.groupItems.add(); 

    drawEllipse(group_field,num,size,width,height,thickness,((w-width)/2)+(thickness/4),h/2,color);
    var x = 100;
    var y = 50;
    drawEllipse(group_field,num,size,width,height,thickness,((w-width)/2)+(thickness/4)+x,h/2+y,color);
}