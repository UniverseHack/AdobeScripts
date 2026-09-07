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
        if (tails == 3) combo = 7;
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
    // Scale the whole tail geometry with the particle size (6 is the default size) so the
    // small gap that detaches the tails from the ball stays proportional at any size.
    var sizeFactor = size / 6;
    var len = (Math.random() * factor + min) * sizeFactor;
    if (l1 == true) addLine(group_g1,cleft+1.8*sizeFactor,ctop-3*sizeFactor,cleft+1.5*sizeFactor,ctop-len,jetWidth,col); // 7.4
    len = (Math.random() * factor+ min) * sizeFactor;
    if (l2 == true) addLine(group_g1,cleft+0.2*sizeFactor,ctop-3.5*sizeFactor,cleft+0.3*sizeFactor,ctop-len,jetWidth,col);  // 6.8
    len = (Math.random() * factor + min) * sizeFactor;
    if (l3 == true) addLine(group_g1,cleft-1*sizeFactor,ctop-3.3*sizeFactor,cleft-0.6*sizeFactor,ctop-len,jetWidth,col); // 10

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

function drawVariedG1(doc,posx,posy,color,width,height,size,angleStart,angleTotal) {
    top = Math.round(Math.random() * height) + height/2 + posy;
    left = Math.round(Math.random() * width) + width/2 + posx;
    angle = angleStart + Math.round(Math.random() * angleTotal);
    scale = 70 + (Math.random() * 30);

    var group_g1 = doc.groupItems.add();
    g1(group_g1,top,left,size,angle,scale,color,0.7,0.4,0);
}


function drawFlowPlaced(doc,posx,posy,number,color,width,height,size,angleStart,angleTotal) {
    var group_flow = doc.groupItems.add();

    for (var i = 0; i < number; i++) {
        var top = Math.round(Math.random() * height) + height/2 + posy;
        var left = Math.round(Math.random() * width) + width/2 + posx;
        var angle = angleStart + Math.round(Math.random() * angleTotal);
        var scale = 70 + (Math.random() * 30);

        var group_g1 = group_flow.groupItems.add();
        g1(group_g1,top,left,size,angle,scale,color,0.7,0.4,0);
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

function calculatePathLength(path) {
    var totalLength = 0;
    var points = path.pathPoints;
    
    for (var i = 0; i < points.length - 1; i++) {
        // Calculate Bezier curve length using multiple sampling points
        var segmentLength = calculateBezierSegmentLength(points[i], points[i + 1]);
        totalLength += segmentLength;
    }
    
    return totalLength;
}

function calculateBezierSegmentLength(p1, p2) {
    var samples = 50; // High sampling for accuracy
    var totalLength = 0;
    var prevPoint = getBezierPointOnSegment(p1, p2, 0);
    
    for (var i = 1; i <= samples; i++) {
        var t = i / samples;
        var currentPoint = getBezierPointOnSegment(p1, p2, t);
        
        var dx = currentPoint.x - prevPoint.x;
        var dy = currentPoint.y - prevPoint.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
        
        prevPoint = currentPoint;
    }
    
    return totalLength;
}

function getBezierPointOnSegment(p1, p2, t) {
    // Get the control points for this Bezier segment
    var anchor1 = p1.anchor;
    var control1 = p1.rightDirection;
    var control2 = p2.leftDirection;
    var anchor2 = p2.anchor;
    
    // Cubic Bezier formula: P(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
    var t2 = t * t;
    var t3 = t2 * t;
    var mt = 1 - t;
    var mt2 = mt * mt;
    var mt3 = mt2 * mt;
    
    var x = mt3 * anchor1[0] + 3 * mt2 * t * control1[0] + 3 * mt * t2 * control2[0] + t3 * anchor2[0];
    var y = mt3 * anchor1[1] + 3 * mt2 * t * control1[1] + 3 * mt * t2 * control2[1] + t3 * anchor2[1];
    
    return { x: x, y: y };
}

function getPointAtPathDistance(path, targetDistance) {
    var currentDistance = 0;
    var points = path.pathPoints;
    
    for (var i = 0; i < points.length - 1; i++) {
        var p1 = points[i];
        var p2 = points[i + 1];
        
        var segmentLength = calculateBezierSegmentLength(p1, p2);
        
        if (currentDistance + segmentLength >= targetDistance) {
            // Find the t parameter along this Bezier curve
            var remainingDistance = targetDistance - currentDistance;
            var t = findBezierTAtDistance(p1, p2, remainingDistance, segmentLength);
            
            // Calculate point on Bezier curve at parameter t
            return getBezierPointOnSegment(p1, p2, t);
        }
        
        currentDistance += segmentLength;
    }
    
    // Return last point if distance exceeds path length
    var lastPoint = points[points.length - 1].anchor;
    return { x: lastPoint[0], y: lastPoint[1] };
}

function findBezierTAtDistance(p1, p2, targetDistance, totalLength) {
    // Use binary search to find the t parameter that gives us the target distance
    var low = 0;
    var high = 1;
    var tolerance = 0.1; // Tolerance for distance matching
    
    for (var iter = 0; iter < 20; iter++) { // Max 20 iterations
        var mid = (low + high) / 2;
        var distance = calculatePartialBezierLength(p1, p2, mid);
        
        if (Math.abs(distance - targetDistance) < tolerance) {
            return mid;
        }
        
        if (distance < targetDistance) {
            low = mid;
        } else {
            high = mid;
        }
    }
    
    return (low + high) / 2;
}

function calculatePartialBezierLength(p1, p2, maxT) {
    var samples = Math.floor(maxT * 50); // Proportional sampling
    if (samples < 1) return 0;
    
    var totalLength = 0;
    var prevPoint = getBezierPointOnSegment(p1, p2, 0);
    
    for (var i = 1; i <= samples; i++) {
        var t = (i / samples) * maxT;
        var currentPoint = getBezierPointOnSegment(p1, p2, t);
        
        var dx = currentPoint.x - prevPoint.x;
        var dy = currentPoint.y - prevPoint.y;
        totalLength += Math.sqrt(dx * dx + dy * dy);
        
        prevPoint = currentPoint;
    }
    
    return totalLength;
}

function getTangentAngleAtDistance(path, distance) {
    // Get point at this distance and slightly ahead
    var point = getPointAtPathDistance(path, distance);
    if (!point) return 0;
    
    var epsilon = 0.5; // Small step ahead
    var nextPoint = getPointAtPathDistance(path, distance + epsilon);
    if (!nextPoint) {
        // Try going backwards if we're at the end
        nextPoint = getPointAtPathDistance(path, distance - epsilon);
        if (!nextPoint) return 0;
        
        // Reverse the direction calculation
        var dx = point.x - nextPoint.x;
        var dy = point.y - nextPoint.y;
    } else {
        var dx = nextPoint.x - point.x;
        var dy = nextPoint.y - point.y;
    }
    
    // Return angle in degrees
    return Math.atan2(dy, dx) * 180 / Math.PI;
}

function drawParticleFlowOnPath(flowWidthStart, flowWidthEnd, particlesDensity, color, sizeStart, sizeEnd) {
    var doc = getDoc();
    var selectedItems = doc.selection;
    
    // Check if a path is selected
    if (selectedItems.length === 0) {
        alert("Please select a path first.");
        return;
    }
    
    var path = selectedItems[0];
    if (path.typename !== "PathItem") {
        alert("Selected object is not a path.");
        return;
    }
    
    // Set default values
    flowWidthStart = flowWidthStart || 40;
    flowWidthEnd = flowWidthEnd || 10;
    particlesDensity = particlesDensity || 5;
    color = color || 'blue';
    sizeStart = sizeStart || 6;
    sizeEnd = sizeEnd || 3;
    
    // Create main group for all particles
    var flowGroup = doc.groupItems.add();
    flowGroup.name = "Particle Flow on Path";
    
    var pathPoints = path.pathPoints;
    if (pathPoints.length < 2) {
        alert("Path needs at least 2 points.");
        return;
    }
    
    // Calculate approximate path length
    var totalPathLength = calculatePathLength(path);
    var stepDistance = 8; // Distance between sampling points along path
    var numSteps = Math.floor(totalPathLength / stepDistance);
    
    // Create continuous flow along the path
    for (var i = 0; i <= numSteps; i++) {
        var distance = i * stepDistance;
        
        // Calculate interpolated flow width and size based on position along path
        var progress = distance / totalPathLength; // 0 to 1 from start to end
        var currentFlowWidth = flowWidthStart + (flowWidthEnd - flowWidthStart) * progress;
        var currentSize = sizeStart + (sizeEnd - sizeStart) * progress;
        
        var pathPoint = getPointAtPathDistance(path, distance);
        var tangentAngle = getTangentAngleAtDistance(path, distance);
        
        if (pathPoint) {
            // Create particles at this cross-section
            createParticlesCrossSection(flowGroup, pathPoint.x, pathPoint.y, 
                                      tangentAngle, currentFlowWidth, particlesDensity, color, currentSize);
        }
    }
}

function createParticlesCrossSection(parentGroup, x, y, tangentAngle, width, particleCount, color, size) {
    // Convert angles to radians
    var perpendicularRad = (tangentAngle + 90) * Math.PI / 180;
    
    // Calculate perpendicular direction for width distribution
    var cosPerp = Math.cos(perpendicularRad);
    var sinPerp = Math.sin(perpendicularRad);
    
    for (var i = 0; i < particleCount; i++) {
        // Random position across the width
        var crossPosition = (Math.random() - 0.5) * width;
        
        // Calculate final position
        var finalX = x + crossPosition * cosPerp;
        var finalY = y + crossPosition * sinPerp;
        
        // Create individual particle group
        var particleGroup = parentGroup.groupItems.add();
        particleGroup.name = "Flow Particle";
        
        // Create the g1 particle directly with the interpolated size and scaled jetWidth
        var scaledJetWidth = (size / 6) * 0.4; // Scale jetWidth with particle size
        g1(particleGroup, finalY, finalX, size, tangentAngle - 90, 100, color, 0.7, scaledJetWidth, 0);
    }
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

function drawParticleWaveOnPath(waveWidthStart, waveWidthEnd, particlesPerWave, waveSpacingStart, waveSpacingEnd, color, sizeStart, sizeEnd) {
    var doc = getDoc();
    var selectedItems = doc.selection;
    
    // Check if a path is selected
    if (selectedItems.length === 0) {
        alert("Please select a path first.");
        return;
    }
    
    var path = selectedItems[0];
    if (path.typename !== "PathItem") {
        alert("Selected object is not a path.");
        return;
    }
    
    // Set default values
    waveWidthStart = waveWidthStart || 80;
    waveWidthEnd = waveWidthEnd || 20;
    particlesPerWave = particlesPerWave || 8;
    waveSpacingStart = waveSpacingStart || 25;
    waveSpacingEnd = waveSpacingEnd || 50;
    color = color || 'blue';
    sizeStart = sizeStart || 6;
    sizeEnd = sizeEnd || 3;
    
    // Create main group for all waves
    var wavesGroup = doc.groupItems.add();
    wavesGroup.name = "Particle Waves on Path";
    
    var pathPoints = path.pathPoints;
    if (pathPoints.length < 2) {
        alert("Path needs at least 2 points.");
        return;
    }
    
    // Calculate total path length using the smooth path calculation
    var totalLength = calculatePathLength(path);
    
    // Calculate wave positions with interpolated spacing
    var wavePositions = [];
    var currentDistance = 0;
    var waveIndex = 0;
    
    // Add the first wave at the start
    wavePositions.push(0);
    
    while (currentDistance < totalLength) {
        // Calculate progress for interpolating spacing (0 to 1)
        var progress = currentDistance / totalLength;
        
        // Interpolate spacing based on current position
        var currentSpacing = waveSpacingStart + (waveSpacingEnd - waveSpacingStart) * progress;
        
        // Move to next wave position
        currentDistance += currentSpacing;
        
        // Add position if it's within the path length
        if (currentDistance <= totalLength) {
            wavePositions.push(currentDistance);
        }
    }
    
    // Create waves at calculated positions
    for (var w = 0; w < wavePositions.length; w++) {
        var distance = wavePositions[w];
        
        // Calculate interpolated wave width and size based on position along path
        var progress = distance / totalLength; // 0 to 1 from start to end
        var currentWaveWidth = waveWidthStart + (waveWidthEnd - waveWidthStart) * progress;
        var currentSize = sizeStart + (sizeEnd - sizeStart) * progress;
        
        // Get position and direction at this distance along the smooth path
        var pathPoint = getPointAtPathDistance(path, distance);
        var pathAngle = getTangentAngleAtDistance(path, distance);
        
        if (pathPoint) {
            createPerpendicularWaveAtPoint(wavesGroup, pathPoint.x, pathPoint.y, 
                                         pathAngle, currentWaveWidth, particlesPerWave, color, currentSize, w);
        }
    }
}

function getPathPositionAndDirection(pathPoints, t) {
    if (pathPoints.length < 2) return null;
    
    // Clamp t to [0, 1]
    t = Math.max(0, Math.min(1, t));
    
    // Find which segment we're on
    var segmentFloat = t * (pathPoints.length - 1);
    var segmentIndex = Math.floor(segmentFloat);
    var segmentT = segmentFloat - segmentIndex;
    
    // Handle edge case
    if (segmentIndex >= pathPoints.length - 1) {
        var lastPoint = pathPoints[pathPoints.length - 1].anchor;
        var prevPoint = pathPoints[pathPoints.length - 2].anchor;
        var dx = lastPoint[0] - prevPoint[0];
        var dy = lastPoint[1] - prevPoint[1];
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        return { x: lastPoint[0], y: lastPoint[1], angle: angle };
    }
    
    // Linear interpolation between adjacent anchor points
    var p1 = pathPoints[segmentIndex].anchor;
    var p2 = pathPoints[segmentIndex + 1].anchor;
    
    var x = p1[0] + (p2[0] - p1[0]) * segmentT;
    var y = p1[1] + (p2[1] - p1[1]) * segmentT;
    
    // Calculate direction angle
    var dx = p2[0] - p1[0];
    var dy = p2[1] - p1[1];
    var angle = Math.atan2(dy, dx) * 180 / Math.PI;
    
    return { x: x, y: y, angle: angle };
}

function createPerpendicularWaveAtPoint(parentGroup, centerX, centerY, pathAngle, waveWidth, particleCount, color, size, waveIndex) {
    var waveGroup = parentGroup.groupItems.add();
    waveGroup.name = "Wave " + (waveIndex + 1);
    
    // Calculate perpendicular angle (90 degrees from path)
    var perpAngle = pathAngle + 90;
    var perpRad = perpAngle * Math.PI / 180;
    
    // Create particles randomly distributed along the perpendicular line
    for (var i = 0; i < particleCount; i++) {
        // Random position along the perpendicular line
        var randomDistance = (Math.random() - 0.5) * waveWidth;
        
        // Calculate particle position
        var particleX = centerX + randomDistance * Math.cos(perpRad);
        var particleY = centerY + randomDistance * Math.sin(perpRad);
        
        // Add small random offset for natural look
        particleX += (Math.random() - 0.5) * 8;
        particleY += (Math.random() - 0.5) * 8;
        
        // Random particle size variation
        var particleSize = size + (Math.random() - 0.5) * size * 0.6; // ±30% size variation
        particleSize = Math.max(2, particleSize); // Minimum size
        
        // Random scale variation
        var scale = 80 + (Math.random() * 40); // 80-120% scale
        
        // Particle angle should be perpendicular to path direction with some variation
        var particleAngle = pathAngle + 90 + (Math.random() - 0.5) * 45; // ±22.5 degrees
        
        // Create the g1 particle
        var particleGroup = waveGroup.groupItems.add();
        particleGroup.name = "Wave Particle " + (i + 1);
        var scaledJetWidth = (particleSize / 6) * 0.4; // Scale jetWidth with particle size
        g1(particleGroup, particleY, particleX, particleSize, particleAngle, scale, color, 0.7, scaledJetWidth, 0);
    }
}


