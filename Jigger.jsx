// Jigger.jsx - Randomly translates, rotates, and scales selected objects
// The values below are only the defaults offered in the settings dialog; what
// the dialog is left showing when OK is pressed is what actually gets applied.
var DEFAULT_MAX_TRANSLATION = 5;      // Maximum distance to move objects (in points)
var DEFAULT_MAX_ROTATION = 6;         // Maximum rotation angle (in degrees)
var DEFAULT_PERCENTAGE_MIN = 95;      // Minimum scale percentage (e.g., 80 = 80% of original size)
var DEFAULT_PERCENTAGE_MAX = 105;     // Maximum scale percentage (e.g., 120 = 120% of original size)
var DEFAULT_CHANGE_ALL_COLORS = true; // Whether every selected object gets a random color

// Function to generate random number within range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Helper: parse a number, falling back to a default only when the text is not a number
function parseNumber(text, defaultValue) {
    var value = parseFloat(text);
    return isNaN(value) ? defaultValue : value;
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

// Function to ask the user how hard to jigger, returning the settings or null
// when the dialog is cancelled
function getUserSettings(itemCount) {
    var dialog = new Window("dialog", "Jigger Settings");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";

    var countLabel = dialog.add("statictext", undefined,
        itemCount + " selected object" + (itemCount === 1 ? "" : "s") + " will be jiggered.");
    countLabel.alignment = "left";

    // Maximum translation, applied as a random offset in both X and Y
    var translationGroup = dialog.add("group");
    translationGroup.add("statictext", undefined, "Max Translation (pt, plus or minus):");
    var translationInput = translationGroup.add("edittext", undefined, String(DEFAULT_MAX_TRANSLATION));
    translationInput.characters = 6;

    // Maximum rotation, applied as a random angle in either direction
    var rotationGroup = dialog.add("group");
    rotationGroup.add("statictext", undefined, "Max Rotation (degrees, plus or minus):");
    var rotationInput = rotationGroup.add("edittext", undefined, String(DEFAULT_MAX_ROTATION));
    rotationInput.characters = 6;

    // Scale range, as a percentage of each object's current size
    var scaleGroup = dialog.add("group");
    scaleGroup.add("statictext", undefined, "Scale Range (%):");
    var scaleMinInput = scaleGroup.add("edittext", undefined, String(DEFAULT_PERCENTAGE_MIN));
    scaleMinInput.characters = 6;
    scaleGroup.add("statictext", undefined, "to");
    var scaleMaxInput = scaleGroup.add("edittext", undefined, String(DEFAULT_PERCENTAGE_MAX));
    scaleMaxInput.characters = 6;

    var colorGroup = dialog.add("group");
    colorGroup.alignment = "left";
    var changeColorsCheck = colorGroup.add("checkbox", undefined, "Give every object a random color");
    changeColorsCheck.value = DEFAULT_CHANGE_ALL_COLORS;

    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");

    // Event handlers
    okButton.onClick = function() {
        var maxTranslation = parseNumber(translationInput.text, DEFAULT_MAX_TRANSLATION);
        var maxRotation = parseNumber(rotationInput.text, DEFAULT_MAX_ROTATION);
        var percentageMin = parseNumber(scaleMinInput.text, DEFAULT_PERCENTAGE_MIN);
        var percentageMax = parseNumber(scaleMaxInput.text, DEFAULT_PERCENTAGE_MAX);

        // Both amounts are used as a plus/minus range, so a negative is meaningless
        if (maxTranslation < 0 || maxRotation < 0) {
            alert("Max translation and max rotation cannot be negative.\nThey are already applied randomly in both directions.");
            return;
        }

        if (percentageMin <= 0 || percentageMax <= 0) {
            alert("Scale percentages must be greater than zero.");
            return;
        }

        if (percentageMin > percentageMax) {
            alert("The minimum scale percentage must not be larger than the maximum.");
            return;
        }

        dialog.close(1);
    };

    cancelButton.onClick = function() {
        dialog.close(0);
    };

    // Show dialog
    var result = dialog.show();

    if (result !== 1) {
        return null; // User cancelled
    }

    return {
        maxTranslation: parseNumber(translationInput.text, DEFAULT_MAX_TRANSLATION),
        maxRotation: parseNumber(rotationInput.text, DEFAULT_MAX_ROTATION),
        percentageMin: parseNumber(scaleMinInput.text, DEFAULT_PERCENTAGE_MIN),
        percentageMax: parseNumber(scaleMaxInput.text, DEFAULT_PERCENTAGE_MAX),
        changeAllColors: changeColorsCheck.value
    };
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

    // Ask for the amounts before touching any artwork, so Cancel changes nothing
    var settings = getUserSettings(itemsToTransform.length);
    if (!settings) {
        return; // User cancelled
    }

    // Transform each item
    for (var j = 0; j < itemsToTransform.length; j++) {
        var currentItem = itemsToTransform[j];

        // Generate random translation values
        var translateX = randomInRange(-settings.maxTranslation, settings.maxTranslation);
        var translateY = randomInRange(-settings.maxTranslation, settings.maxTranslation);

        // Generate random rotation value
        var rotationAngle = randomInRange(-settings.maxRotation, settings.maxRotation);

        // Generate random scale percentage
        var scalePercentage = randomInRange(settings.percentageMin, settings.percentageMax);

        // Change color if option is enabled
        if (settings.changeAllColors) {
            applyRandomColor(currentItem);
        }

        // Apply translation
        currentItem.translate(translateX, translateY);

        // Apply rotation around the item's center
        currentItem.rotate(rotationAngle, true, true, true, true, Transformation.CENTER);

        // Apply scaling around the item's center
        currentItem.resize(scalePercentage, scalePercentage, true, true, true, true, scalePercentage, Transformation.CENTER);
    }

    alert("Jigger complete! Transformed " + itemsToTransform.length + " selected objects.");
}

// Execute the function
jiggerObjects();
