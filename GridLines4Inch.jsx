// Adobe Illustrator Script: Custom Square Grid Lines
// Draws a grid of lines with user-specified spacing over the entire artboard

function drawCustomGrid() {
    // Check if there's an active document
    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var artboardRect = artboard.artboardRect;
    
    // Artboard dimensions (left, top, right, bottom)
    var left = artboardRect[0];
    var top = artboardRect[1];
    var right = artboardRect[2];
    var bottom = artboardRect[3];
    
    var width = right - left;
    var height = top - bottom;
    
    // Ask user for grid spacing
    var inches = prompt("Enter grid spacing in inches:", "4");
    
    // Validate input
    if (inches === null) {
        return; // User cancelled
    }
    
    inches = parseFloat(inches);
    if (isNaN(inches) || inches <= 0) {
        alert("Please enter a valid positive number for inches.");
        return;
    }
    
    // Convert inches to points (1 inch = 72 points)
    var gridSpacing = inches * 72;
    
    // Create a group for the grid lines
    var gridGroup = doc.groupItems.add();
    gridGroup.name = inches + "-Inch Grid";
    
    // Set up line style
    var strokeColor = new RGBColor();
    strokeColor.red = 0;
    strokeColor.green = 0;
    strokeColor.blue = 0;
    
    var strokeWidth = 0.5; // 0.5 point line width
    
    // Draw vertical lines
    for (var x = left; x <= right; x += gridSpacing) {
        var verticalLine = gridGroup.pathItems.add();
        verticalLine.setEntirePath([[x, top], [x, bottom]]);
        verticalLine.strokeColor = strokeColor;
        verticalLine.strokeWidth = strokeWidth;
        verticalLine.filled = false;
        verticalLine.stroked = true;
    }
    
    // Draw horizontal lines
    for (var y = bottom; y <= top; y += gridSpacing) {
        var horizontalLine = gridGroup.pathItems.add();
        horizontalLine.setEntirePath([[left, y], [right, y]]);
        horizontalLine.strokeColor = strokeColor;
        horizontalLine.strokeWidth = strokeWidth;
        horizontalLine.filled = false;
        horizontalLine.stroked = true;
    }
    
    alert(inches + "-inch grid created successfully!\nLines: " + gridGroup.pathItems.length);
}

// Run the function
drawCustomGrid();