// Jigger.jsx - Randomly translates, rotates, and scales selected objects
// Set maximum translation, rotation, and scaling values here
var maxTranslation = 5;  // Maximum distance to move objects (in points)
var maxRotation = 6;     // Maximum rotation angle (in degrees)
var percentageMin = 95;   // Minimum scale percentage (e.g., 80 = 80% of original size)
var percentageMax = 105;  // Maximum scale percentage (e.g., 120 = 120% of original size)
var changeAllColors = true; // Set to true to change color of every selected object, false for no color changes

// Function to generate random number within range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to generate a random RGB color
function getRandomColor() {
    var color = new RGBColor();
    color.red = Math.floor(Math.random() * 256);
    color.green = Math.floor(Math.random() * 256);
    color.blue = Math.floor(Math.random() * 256);
    return color;
}

// Function to apply random color to an object
function applyRandomColor(item) {
    try {
        var randomColor = getRandomColor();
        
        // Try to apply color to fill if the object has a fill
        if (item.filled) {
            item.fillColor = randomColor;
        }
        // If no fill, try to apply to stroke
        else if (item.stroked) {
            item.strokeColor = randomColor;
        }
        // For text items, apply to fill
        else if (item.typename === "TextFrame") {
            item.textRange.fillColor = randomColor;
        }
    } catch (e) {
        // Silently continue if color application fails for this object type
    }
}

// Function to randomly transform selected objects
function jiggerObjects() {
    // Check if there's an active document
    if (app.documents.length === 0) {
        alert("No document is open. Please open a document first.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Get selected objects
    var selectedItems = doc.selection;
    var itemsToTransform = [];
    
    // Check if anything is selected
    if (selectedItems.length === 0) {
        alert("No objects are selected. Please select one or more objects to jigger.");
        return;
    }
    
    // Filter selected items to only include those that are visible and not locked
    for (var i = 0; i < selectedItems.length; i++) {
        var item = selectedItems[i];
        
        // Check if the item is visible and not locked
        if (!item.hidden && !item.locked) {
            itemsToTransform.push(item);
        }
    }
    
    if (itemsToTransform.length === 0) {
        alert("No unlocked and visible objects are selected to transform.");
        return;
    }
    
    // Transform each item
    for (var j = 0; j < itemsToTransform.length; j++) {
        var currentItem = itemsToTransform[j];
        
        // Generate random translation values
        var translateX = randomInRange(-maxTranslation, maxTranslation);
        var translateY = randomInRange(-maxTranslation, maxTranslation);
        
        // Generate random rotation value
        var rotationAngle = randomInRange(-maxRotation, maxRotation);
        
        // Generate random scale percentage
        var scalePercentage = randomInRange(percentageMin, percentageMax);
        
        // Change color if option is enabled
        if (changeAllColors) {
            applyRandomColor(currentItem);
        }
        
        // Apply translation
        currentItem.translate(translateX, translateY);
        
        // Apply rotation around the item's center
        var itemCenter = [
            (currentItem.geometricBounds[0] + currentItem.geometricBounds[2]) / 2,
            (currentItem.geometricBounds[1] + currentItem.geometricBounds[3]) / 2
        ];
        
        currentItem.rotate(rotationAngle, true, true, true, true, Transformation.CENTER);
        
        // Apply scaling around the item's center
        currentItem.resize(scalePercentage, scalePercentage, true, true, true, true, scalePercentage, Transformation.CENTER);
    }
    
    alert("Jigger complete! Transformed " + itemsToTransform.length + " selected objects.");
}

// Execute the function
jiggerObjects();