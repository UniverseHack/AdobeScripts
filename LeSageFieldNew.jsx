#include "TPM.jsx";

var number = Number(prompt("Number of G1s","20"));
if (number > 0) {
    var objectColor = prompt("Object Color?","gray");
    var gColor = prompt("Field Particle Color?","lightblue");
    var width = 30;
    var height = 15;
    var size = 20;
    var object = [
            127,128,129,130,               141,142,143,144,
        156,157,158,159,160,161,       170,171,172,173,174,175,
        186,187,188,189,190,191,       200,201,202,203,204,205,
        216,217,218,219,220,221,       230,231,232,233,234,235,
        246,247,248,249,250,251,       260,261,262,263,264,265,
            277,278,279,280,               291,292,293,294,
    ];


    var group_field = getDoc().groupItems.add();

    graviticCanvasField(group_field,number,width,height,size,object,objectColor,gColor,false);   
}
