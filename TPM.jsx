function graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly) {
    var canvas = fieldCanvas(group_field,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText);
    this.drawCanvas(canvas);
    if (canvasOnly == false) {
        for (var i = 0; i < number; i++) {
            randomLine(canvas);
        }
    }
}

function fieldCanvas(doc,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText) {
    var canvas = {
        doc: doc,
        width: width,
        height: height,
        size: size,
        spacing: spacing,
        object: object,
        objectColor: objectColor,
        impactColor: impactColor,
        passColor: passColor,
        reduction: reduction,
        gridText: gridText,
        square: 0,
        isObject : function(squareNumber) {
            for (var i = 0; i < this.object.length; i++) {
                var square = this.object[i];
                if (square == squareNumber)
                    return true;
            }
            return false;
        },
        canvasWidth : function() {
            return this.width * this.size;
        },
        canvasHeight : function() {
            return this.height * this.size;
        }
    }
    return canvas;
}

function drawCanvas(canvas) {
    var group_canvas = canvas.doc.groupItems.add();
    group_canvas.name = "Canvas";

    for (var i = 0; i < canvas.height; i++) {
        for (var j = 0; j < canvas.width; j++) {
            var top = -i*canvas.size;
            var left = j*canvas.size;
            var squareNumber = j + i * canvas.width + 1;
            var square = group_canvas.pathItems.rectangle(top,left,canvas.size,canvas.size);
            square.strokeWidth = 0.25;
            if (canvas.isObject(squareNumber))
                square.fillColor = colorByName(canvas.objectColor);
            else
                square.fillColor = colorByName('white');
            if (canvas.gridText)
                pointText(group_canvas,squareNumber.toString(),left,top);
        }
    }
}

function randomLine(canvas) {
    var side1 = Math.ceil(Math.random() * 4);
    var side2 = Math.ceil(Math.random() * 4);
    while (side2 == side1) {
        side2 = Math.ceil(Math.random() * 4);
    }
    var x1 = Math.random() * canvas.width * canvas.size;
    var y1 = Math.random() * canvas.height * canvas.size * -1;
    var x2 = Math.random() * canvas.width * canvas.size;
    var y2 = Math.random() * canvas.height * canvas.size * -1;

    if (side1 == 1) {
        y1 = 0;
    } else if (side1 == 3) {
        y1 = -canvas.height * canvas.size;
    } else if (side1 == 2) {
        x1 = canvas.width * canvas.size;
    } else if (side1 == 4) {
        x1 = 0;
    }

    if (side2 == 1) {
        y2 = 0;
    } else if (side2 == 3) {
        y2 = -canvas.height * canvas.size;
    } else if (side2 == 2) {
        x2 = canvas.width * canvas.size;
    } else if (side2 == 4) {
        x2 = 0;
    }

    var group_g1s = canvas.doc.groupItems.add();

    //addLine(group_g1s,x1,y1,x2,y2,0.15,'black');

    var dist = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    var angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI - 90;

    group_g1s.name = "G1 Field";
    var passing = false;
    var color = canvas.impactColor;
    var spacing = canvas.spacing;
    var num = Math.ceil(dist / spacing);
    var stepx = (x2 - x1) / num;
    var stepy = (y2 - y1) / num;
    var squaresPassed = 0;
    var lastSquare = 0;
    var iMod = 1;

    for (var i = 0; i < num; i += iMod) {
        var varyStep = Math.random() - 0.5;
        var stepVaryX = stepx*varyStep;
        var stepVaryY = stepy*varyStep;
        var top = x1 + i*stepx + stepVaryX;
        var left = y1 + i*stepy + stepVaryY;
        var g1_group = group_g1s.groupItems.add();
        g1_group.name = "G1 Particle";
        var drawit = true;

        if (pointInObject(canvas,top,left)) {
            if (canvas.reduction == 0)
                break;
            if (canvas.square != lastSquare)
                squaresPassed++;
            passing = true;
            lastSquare = canvas.square;
            drawit = false;

        } else if (passing) {
            color = canvas.passColor;
            passing = false;
            iMod = squaresPassed * canvas.reduction;
            squaresPassed = 0;
        }
        if (drawit)
            g1(g1_group,left,top,6,angle,50,color,0.7,0.4,1);
    }
}

function pointInObject(canvas,top,left) {
    var x = Math.abs(Math.ceil(top / canvas.size));
    var y = Math.abs(Math.ceil(left / canvas.size));
    canvas.square = x + y * canvas.width;
    return canvas.isObject(canvas.square);
}

function pointInCanvas(canvas,top,left) {
    t = Math.abs(top);
    l = Math.abs(left);
    h = canvas.height * canvas.size;
    w = canvas.width * canvas.size;
    if ((t <= h && t >= 0) && (l <= w && l >= 0))
        return true;
    return false;
}

function getDoc() {
    var doc;
    if (app.documents.length == 0) {
        doc = app.documents.add(DocumentColorSpace.CMYK, 792.0, 612.0);
     } else {
        doc = app.activeDocument;
    }

    doc.defaultFilled = true;
    doc.defaultStroked = true;
        
    //var debugStyle = doc.characterStyles.add("debug");
    //var charAttr = debugStyle.characterAttributes;
    //charAttr.size = 8;

    return doc;
}

function g1(group_g1,top,left,size,angle,scale,color,stroke,jetWidth,tails) {
    var ctop = top - size / 2; 
    var cleft = left + size / 2;
    var min = 6.8;

    var factor = 9;
    var combo = 1 + Math.random() * 6;
    var l1 = false;
    var l2 = false;
    var l3 = false;

    if (tails > 0) {
        if (tails == 3) combo = 6;
        else if (tails == 2) combo = 5;
        else if (tails == 1) combo = 1;
    }

    if (combo <= 1) {
        l2 = true;
    } else if (combo <= 2) {
        l2 = true;
    } else if (combo <= 3) {
        l3 = true;
    } else if (combo <= 4) {
        l1 = true;
        l2 = true;
    } else if (combo <= 5) {
        l1 = true;
        l3 = true;
    } else if (combo <= 6) {
        l2 = true;
        l3 = true;
    } else {
        l1 = true;
        l2 = true;
        l3 = true;
    }

    var col = 'black';
    var len = Math.random() * factor + min;
    if (l1 == true) addLine(group_g1,cleft+1.8,ctop-3,cleft+1.5,ctop-len,jetWidth,col); // 7.4
    len = Math.random() * factor+ min;
    if (l2 == true) addLine(group_g1,cleft+0.2,ctop-3.5,cleft+0.3,ctop-len,jetWidth,col);  // 6.8
    len = Math.random() * factor + min;
    if (l3 == true) addLine(group_g1,cleft-1,ctop-3.3,cleft-0.6,ctop-len,jetWidth,col); // 10

    var circle = group_g1.pathItems.ellipse(top,left,size,size,false,true);
    circle.strokeWidth = stroke;
    circle.fillColor = colorByName(color);
    group_g1.rotate(angle);
    group_g1.resize(
        scale, // x
        scale, // y
        true, // changePositions
        false, // changeFillPatterns
        false, // changeFillGradients
        true, // changeStrokePattern
        scale // changeLineWidths
    );
}

function sun(group_sun,top,left,side,scale,color,opacity) {
    var number = Math.ceil(Math.random() * 5) + 3;
    var vart = 0;
    var varl = 0;

    var noColor = new NoColor();

    for (var i = 0; i < number; i++) {
        vart = 6 - Math.random()*3;
        varl = 6 - Math.random()*3;
        
        var circle = group_sun.pathItems.ellipse(top+vart, left+varl, side, side, false, true);
        circle.strokeWidth = 0.3;
        if (i == 0)
            circle.fillColor = colorByName(color);
        else
            circle.fillColor = noColor;
        circle.opacity = opacity;
    }
    group_sun.resize(
        scale, // x
        scale, // y
        true, // changePositions
        false, // changeFillPatterns
        false, // changeFillGradients
        true, // changeStrokePattern
        scale // changeLineWidths
    );
}

function drawEllipse(doc, number, size, width, height, thickness, xorg, yorg, color)
{
    var group_ellipse = doc.groupItems.add();
   
    for (var i = 0; i < number; i++)
    {
        var ang = Math.random()*360;
        var rad = (ang * Math.PI)/180;
        var w = width - thickness + Math.random() * thickness;
        var h = height - thickness + Math.random() * thickness;
        var x = (w/2) * Math.cos(rad) + xorg;
        var y = (h/2) * Math.sin(rad) + yorg;
        scale = 70 + (Math.random() * 30);
        var group_g1 = group_ellipse.groupItems.add();
        g1(group_g1,y,x,size,ang-10,scale,color,0.7,0.35,0);
     }
}

function drawPerpLinesCircle(doc, number, radius, length, thickness, xc, yc)
{
    var group_lines = doc.groupItems.add();
    var circle = group_lines.pathItems.ellipse(yc+radius/2,xc-radius/2,radius,radius);
    circle.strokeWidth = thickness;
    
    var degree = 360 / number;
    var arrowAngle = 17;
    var arrowLength = 5;

     for (var i = 0; i < number; i++)
    {
        var angle = i * degree;
        var rad = (angle * Math.PI)/180;
        var x1 = (radius/2) * Math.cos(rad) + xc;
        var y1 = (radius/2) * Math.sin(rad) + yc;
        var x2 = ((radius+length)/2) * Math.cos(rad) + xc;
        var y2 = ((radius+length)/2) * Math.sin(rad) + yc;
        var line = addLine(group_lines,x1,y1,x2,y2,thickness,'black');
        var rad1 = ((angle-arrowAngle) * Math.PI)/180;
        var xa = x1 + (arrowLength * Math.cos(rad1));
        var ya = y1 + (arrowLength * Math.sin(rad1));
        var line1 = addLine(group_lines,x1,y1,xa,ya,thickness,'black');
        var rad2 = ((angle+arrowAngle) * Math.PI)/180;
        var xb = x1 + (arrowLength * Math.cos(rad2));
        var yb = y1 + (arrowLength * Math.sin(rad2));
        var line1 = addLine(group_lines,x1,y1,xb,yb,thickness,'black');
    }
}

function drawPerpLinesCircleShadow(doc, number, radius, length, thickness, xc, yc)
{
    var group_lines = doc.groupItems.add();
    var circle = group_lines.pathItems.ellipse(yc+radius/2,xc-radius/2,radius,radius);
    circle.strokeWidth = thickness;
    
    var degree = 360 / number;
    var arrowAngle = 17;
    var arrowLength = 5;

     for (var i = 0; i < number; i++)
    {
        var angle = i * degree;
        var scale = 30 + angle*7/18;
        if (angle > 180) scale = 30 + (360 - angle*7/18);
        var rad = (angle * Math.PI)/180;
        var x1 = (radius/2) * Math.cos(rad) + xc;
        var y1 = (radius/2) * Math.sin(rad) + yc;
        var x2 = ((radius+length)/2) * Math.cos(rad) + xc;
        var y2 = ((radius+length)/2) * Math.sin(rad) + yc;

        var line = addLine(group_lines,x1,y1,x2,y2,thickness,'black');
        line.resize(scale,scale,true,false,false,true,scale);

        var rad1 = ((angle-arrowAngle) * Math.PI)/180;
        var xa = x1 + (arrowLength * Math.cos(rad1));
        var ya = y1 + (arrowLength * Math.sin(rad1));
        var line1 = addLine(group_lines,x1,y1,xa,ya,thickness,'black');
        line1.resize(scale,scale,true,false,false,true,scale);

        var rad2 = ((angle+arrowAngle) * Math.PI)/180;
        var xb = x1 + (arrowLength * Math.cos(rad2));
        var yb = y1 + (arrowLength * Math.sin(rad2));
        var line2 = addLine(group_lines,x1,y1,xb,yb,thickness,'black');
        line2.resize(scale,scale,true,false,false,true,scale);
    }
}

function sunLinePerspective(doc, number, size, x1, y1, x2, y2, color, opacity) {
    var group_suns = doc.groupItems.add();

    var ystep = (y2 - y1) / number;
    var xstep = (x2 - x1) / number;
    var factor = 0.75;
    var yper = ystep;
    var xper = xstep;
    var y = y1;
    var x = x1;
    var scale = 100;

    for (var i = 0; i < number; i++) {
        var group_sun = group_suns.groupItems.add();
        sun(group_sun,y,x,size,scale,color,opacity);
        y = y + yper;
        x = x + xper;
        scale = scale * factor;
        yper = yper * factor;
        xper = xper * factor;
    }
}

function sunRadial(group, number, sizeSun, size, xin, yin, scale, radius, color, stroke, jetWidth) {
    var group_sun_radial = group.groupItems.add();

    for (var i = 0; i < number; i++) {
        var ang = Math.random()*360;
        var rad = (ang * Math.PI)/180;
        var len = i*i/number + sizeSun/2;
        x = len * Math.cos(rad) + xin;
        y = len * Math.sin(rad) + yin;
        var group_g1 = group_sun_radial.groupItems.add();
        g1(group_g1,y,x,size,ang-90,100,color,stroke,jetWidth,0);
    }
    var group_sun = group_sun_radial.groupItems.add();
    sun(group_sun,yin,xin - sizeSun/1.5,sizeSun,100,"yellow",100);
    
    group_sun_radial.resize(scale,scale);
    group_sun_radial.opacity = (100 - scale) / 3 + scale;
}

function sunsRadial(numSun, sunSize, numG1s, color, size, stroke, jetWidth, radius, width, height, min, max) {
    var doc = getDoc();
    var w = doc.width;
    var h = doc.height;
    var scales = [];
    var group_radial = doc.groupItems.add();

    for (var i = 0; i < numSun; i++) {
        scales.push(min + Math.round(Math.random() * (max - min)));
    }
    scales.sort(function(a, b){return a-b});

    for (var i = 0; i < numSun; i++) {
        top = Math.round(Math.random() * height) + (h - height)/2;
        left = Math.round(Math.random() * width) + (w - width)/2;
        scale = scales[i];
    
        var sun = sunRadial(group_radial,numG1s,sunSize,size,left,top,scale,radius,color,stroke,jetWidth);
    }
}

function field(doc, obj, color, num, size, min, max, width, height) {
    var doc = getDoc();
    var w = doc.width;
    var h = doc.height;
    var group_field = doc.groupItems.add();

    for (var i = 0; i < num; i++) {
        top = Math.round(Math.random() * height) + (h - height)/2;
        left = Math.round(Math.random() * width) + (w - width)/2;
        angle = Math.round(Math.random() * 360);
        scale = Math.floor(min + (Math.random() * (max - min)));
    
        var group_g1 = group_field.groupItems.add();
        if (obj == 'sun')
            sun(group_g1,top,left,size,scale,color,100);
        else
            g1(group_g1,top,left,size,angle,scale,color,0.7,0.35,0);
    }
}

function drawFlowPlaced(doc,posx,posy,number,color,width,height,size,angleStart,angleTotal) {
    var group_flow = doc.groupItems.add();

    for (var i = 0; i < number; i++) {
        top = Math.round(Math.random() * height) + height/2 + posy;
        left = Math.round(Math.random() * width) + width/2 + posx;
        angle = angleStart + Math.round(Math.random() * angleTotal);
        scale = 70 + (Math.random() * 30);

        var group_g1 = group_flow.groupItems.add();
        g1(group_g1,top,left,size,angle,100,color,0.7,0.4,0);
    }
}

function drawFlow(group_flow,number,color,width,height,size,angleStart,angleTotal,adjusttop,adjustleft) {
    var doc = getDoc();
    var w = doc.width;
    var h = doc.height;

    for (var i = 0; i < number; i++) {
        top = Math.round(Math.random() * height) + (h - height)/2 + adjusttop;
        left = Math.round(Math.random() * width) + (w - width)/2 + adjustleft;
        angle = angleStart + Math.round(Math.random() * angleTotal);
        scale = 70 + (Math.random() * 30);

        var group_g1 = group_flow.groupItems.add();
        g1(group_g1,top,left,size,angle,100,color,0.7,0.4,0);
    }
}

function drawWave (group_waves,number,x,y,g1Number,spacing,color) {
    var step = Math.PI / number;
    var ang = 0;
    var group_wave = group_waves.groupItems.add();

    for (var i = 0; i < number + 1; i++) {
        num = Math.floor((Math.sin(ang)) * g1Number);
        if (num == 0) num = Math.floor(Math.random() * 3) + 1;
        drawFlowPlaced(group_wave,x,y,num,color,50,20,6,-10,20);
        y = y + spacing;
        ang = ang + step;
    }
}

function colorByName(colorName) {
    var colorRef = new RGBColor();

    switch (colorName) {
        case 'blue':
            colorRef.red = 0;
            colorRef.green = 0;
            colorRef.blue = 255;
            break;
        case 'lightblue':
            colorRef.red = 150;
            colorRef.green = 150;
            colorRef.blue = 255;
            break;
        case 'red':
            colorRef.red = 255;
            colorRef.green = 0;
            colorRef.blue = 0;
            break;
        case 'black':
            colorRef.red = 0;
            colorRef.green = 0;
            colorRef.blue = 0;
            break;        
        case 'white':
            colorRef.red = 255;
            colorRef.green = 255;
            colorRef.blue = 255;
            break;
        case 'gray':
            colorRef.red = 180;
            colorRef.green = 180;
            colorRef.blue = 180;
            break;
        case 'yellow':
            colorRef.red = 255;
            colorRef.green = 255;
            colorRef.blue = 0;
            break;
        case 'green':
            colorRef.red = 0;
            colorRef.green = 255;
            colorRef.blue = 0;
            break;
        case 'brown':
            colorRef.red = 159;
            colorRef.green = 161;
            colorRef.blue = 77;
            break;
        default:
            console.log('Sorry, we are out of ' + colorName + '.');
    }
    return colorRef;
}

function addLine(group, x1, y1, x2, y2, thickness, color)
{
    liners = group.pathItems.add();
    liners.strokeWidth = thickness;
    liners.strokeColor = colorByName(color);
    liners.setEntirePath([[x1,y1],[x2,y2]]);
    return liners;
}

function pointText(doc, tex, x, y)
{
	// Point Text
    var pointText = doc.textFrames.add();
	pointText.contents = tex;
	pointText.top = y;
    pointText.left = x;
    pointText.size = 8;

    //var debugStyle = doc.characterStyles.getByName("debug");
    //debugStyle.applyTo(pointText.textRange);
}
