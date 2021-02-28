function graviticCanvasField(group_field,number,width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,canvasOnly,drawLines) {
    var canvas = fieldCanvas(width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,drawLines);
    this.drawCanvas(group_field,canvas);
    var group_lines = group_field.groupItems.add();
    group_lines.name = "G1 Field";

    if (canvasOnly == false) {
        for (var i = 0; i < number; i++) {
            if (!randomLine(group_lines,canvas))
                i--;
        }
    }
}

function fieldCanvas(width,height,size,spacing,object,reduction,objectColor,impactColor,passColor,gridText,drawLines) {
    var canvas = {
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
        drawLines: drawLines,
        square: 0,
        isObject : function(squareNumber) {
            var range = false;
            for (var i = 0; i < this.object.length; i++) {
                var square = this.object[i];
                if (square < 0) {
                    range = true;
                    square = Math.abs(square);
                } else if (range) {
                    if (squareNumber < square)
                        return true;
                    range = false;
                }
                if (squareNumber < square)
                    return false;
                else if (square == squareNumber)
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

function drawCanvas(group,canvas) {
    var group_canvas = group.groupItems.add();
    group_canvas.name = "Canvas";

    for (var i = 0; i < canvas.height; i++) {
        for (var j = 0; j < canvas.width; j++) {
            var top = -i*canvas.size;
            var left = j*canvas.size;
            var squareNumber = j + i * canvas.width + 1;
            var square = group_canvas.pathItems.rectangle(top,left,canvas.size,canvas.size);
            square.stroked = canvas.gridText;
            if (canvas.isObject(squareNumber))
                square.fillColor = colorByName(canvas.objectColor);
            else
                square.filled = false;
            if (canvas.gridText)
                pointText(group_canvas,squareNumber.toString(),left,top);
        }
    }
}

function pickPoint(canvas) {
    var width = canvas.width * canvas.size;
    var height = canvas.height * canvas.size;

    var length = (width + height) * 2 * Math.random();
    var x1 = 0;
    var y1 = 0;
    var x2 = 0;
    var y2 = 0;
    var side = 0;

    if (length <= width) {
        x1 = length;
        y1 = 0;
        side = 1;
    } else if (length <= width + height) {
        x1 = width;
        y1 = length - width;
        side = 2;
    } else if (length <= width + height + width) {
        x1 = length - width - height;
        y1 = height;
        side = 3;
    } else {
        x1 = 0;
        y1 = length - width - height - width; 
        side = 4;     
    }

    var point = {
        "x": x1,
        "y": -y1,
        "side": side
    }
    return point;
}

function randomLine(group, canvas) {
    var width = canvas.width * canvas.size;
    var height = canvas.height * canvas.size;

    var point1 = pickPoint(canvas);
    var point2 = pickPoint(canvas);
    while (point1.side == point2.side)
        point2 = pickPoint(canvas);

    var x1 = point1.x;
    var y1 = point1.y;
    var x2 = point2.x;
    var y2 = point2.y;

    var group_line = group.groupItems.add();
    group_line.name = "G1 Line";

    if (canvas.drawLines)
        addLine(group_line,x1,y1,x2,y2,0.5,'gray');

    var dist = Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    var angle = Math.atan2(y2-y1, x2-x1) * 180 / Math.PI - 90;

    var passing = false;
    var color = canvas.impactColor;
    var spacing = canvas.spacing;
    var num = Math.ceil(dist / spacing);
    var stepx = (x2 - x1) / num;
    var stepy = (y2 - y1) / num;
    var stepxOrig = stepx;
    var stepyOrig = stepy;
    var squaresPassed = 0;
    var lastSquare = 0;

    var top = x1;
    var left = y1;
    var hit = false;

    for (var i = 0; i < num; i++) {
        top += stepx;
        left += stepy;

        if (pointInObject(canvas,top,left)) {
            hit = true;
            break;
        }
    }

    if (hit == false)
        return false;

    top = x1;
    left = y1;

    for (var i = 0; i < num; i++) {
        var stepVaryX = stepx*Math.random();
        var stepVaryY = stepy*Math.random();
        top += stepx;
        left += stepy;
        var topa = top + stepVaryX;
        var lefta = left + stepVaryY;

        if (topa > width || topa < 0 || lefta < -height || lefta > 0)
            continue;

        var drawit = true;

        if (pointInObject(canvas,topa,lefta)) {
            hit = true;
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
            stepx = stepxOrig + canvas.reduction*(squaresPassed*stepxOrig/2);
            stepy = stepyOrig + canvas.reduction*(squaresPassed*stepyOrig/2);
            drawit = false;
        }

        if (drawit) {
            var g1_group = group_line.groupItems.add();
            g1_group.name = "G1 Particle";
            g1(g1_group,lefta,topa,6,angle,50,color,0.7,0.4,1);
        }
    }

    return true;
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
        case 'orange':
            colorRef.red = 255;
            colorRef.green = 165;
            colorRef.blue = 0;
            break;
        case 'gray':
            colorRef.red = 180;
            colorRef.green = 180;
            colorRef.blue = 180;
            break;
        case 'darkgray':
            colorRef.red = 260;
            colorRef.green = 260;
            colorRef.blue = 260;
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
