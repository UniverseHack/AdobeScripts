/*
 * WordList Script for Adobe Illustrator
 * Reads words from "words.txt" file and places them on artboard
 * Author: Adobe Scripts Collection
 * Date: 2026
 */

// Main function
function main() {
    // Check if Illustrator document is open
    if (app.documents.length === 0) {
        alert("Please open a document in Illustrator before running this script.");
        return;
    }
    
    var doc = app.activeDocument;
    
    // Get script file location
    var scriptFile = new File($.fileName);
    var scriptFolder = scriptFile.parent;
    var wordsFile = new File(scriptFolder + "/words.txt");
    
    // Check if words.txt exists
    if (!wordsFile.exists) {
        alert("Error: words.txt file not found in the script directory.\nPlease create a words.txt file with one word per line in:\n" + scriptFolder.fsName);
        return;
    }
    
    // Get user preferences for font settings
    var settings = getUserSettings();
    if (!settings) {
        return; // User cancelled
    }
    
    // Read words from file
    var words = readWordsFromFile(wordsFile);
    if (words.length === 0) {
        alert("Error: words.txt file is empty or could not be read.");
        return;
    }
    
    // Create text items on artboard
    createTextItems(doc, words, settings);
    
    alert("Successfully placed " + words.length + " words on the artboard!");
}

// Function to get user settings for font and size
function getUserSettings() {
    var dialog = new Window("dialog", "Random Word List Settings");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";
    
    // Font family input
    var fontGroup = dialog.add("group");
    fontGroup.add("statictext", undefined, "Font Family:");
    var fontInput = fontGroup.add("edittext", undefined, "Arial");
    fontInput.characters = 20;
    
    // Font size range
    var sizeGroup = dialog.add("group");
    sizeGroup.add("statictext", undefined, "Font Size Range (pt):");
    var minSizeInput = sizeGroup.add("edittext", undefined, "16");
    minSizeInput.characters = 6;
    sizeGroup.add("statictext", undefined, "to");
    var maxSizeInput = sizeGroup.add("edittext", undefined, "48");
    maxSizeInput.characters = 6;
    
    // Artboard area for random placement
    var areaGroup = dialog.add("group");
    areaGroup.add("statictext", undefined, "Placement Area (X, Y, Width, Height):");
    var areaXInput = areaGroup.add("edittext", undefined, "50");
    areaXInput.characters = 6;
    var areaYInput = areaGroup.add("edittext", undefined, "50");
    areaYInput.characters = 6;
    var areaWInput = areaGroup.add("edittext", undefined, "700");
    areaWInput.characters = 6;
    var areaHInput = areaGroup.add("edittext", undefined, "500");
    areaHInput.characters = 6;
    
    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    // Event handlers
    okButton.onClick = function() {
        dialog.close(1);
    };
    
    cancelButton.onClick = function() {
        dialog.close(0);
    };
    
    // Show dialog
    var result = dialog.show();
    
    if (result === 1) {
        return {
            fontFamily: fontInput.text || "Arial",
            minFontSize: parseFloat(minSizeInput.text) || 16,
            maxFontSize: parseFloat(maxSizeInput.text) || 48,
            areaX: parseFloat(areaXInput.text) || 50,
            areaY: parseFloat(areaYInput.text) || 50,
            areaWidth: parseFloat(areaWInput.text) || 700,
            areaHeight: parseFloat(areaHInput.text) || 500
        };
    }
    
    return null;
}

// Function to read words from text file
function readWordsFromFile(file) {
    var words = [];
    
    try {
        file.open("r");
        
        // Read entire file content at once to avoid infinite loop
        var content = file.read();
        file.close();
        
        if (content) {
            // Split by line breaks and process each line
            var lines = content.split(/[\r\n]+/);
            
            for (var i = 0; i < lines.length; i++) {
                var line = lines[i].replace(/^\s+|\s+$/g, ''); // Trim whitespace
                if (line.length > 0) {
                    words.push(line);
                }
            }
        }
        
    } catch (e) {
        alert("Error reading file: " + e.message);
        try {
            file.close();
        } catch (closeError) {
            // Ignore close error
        }
    }
    
    return words;
}

// Function to create text items on artboard with random placement, rotation, and size
function createTextItems(doc, words, settings) {
    for (var i = 0; i < words.length; i++) {
        var textFrame = doc.textFrames.add();
        textFrame.contents = words[i];
        
        // Generate random position within the specified area
        var randomX = settings.areaX + Math.random() * settings.areaWidth;
        var randomY = settings.areaY + Math.random() * settings.areaHeight;
        textFrame.position = [randomX, randomY];
        
        // Generate random rotation (0-360 degrees)
        var randomRotation = Math.random() * 360;
        textFrame.rotate(randomRotation);
        
        // Generate random font size within the specified range
        var randomSize = settings.minFontSize + Math.random() * (settings.maxFontSize - settings.minFontSize);
        
        // Set font properties
        var textRange = textFrame.textRange;
        textRange.characterAttributes.size = randomSize;
        
        // Try to set font family (with error handling for missing fonts)
        try {
            textRange.characterAttributes.textFont = app.textFonts.getByName(settings.fontFamily);
        } catch (e) {
            // If font not found, try common alternatives
            try {
                textRange.characterAttributes.textFont = app.textFonts.getByName("ArialMT");
            } catch (e2) {
                try {
                    textRange.characterAttributes.textFont = app.textFonts.getByName("Helvetica");
                } catch (e3) {
                    // Use whatever font is available
                    if (app.textFonts.length > 0) {
                        textRange.characterAttributes.textFont = app.textFonts[0];
                    }
                }
            }
        }
    }
    
    // Note: Removing auto-fit as words are now randomly placed across the artboard
}

// Function to list available fonts (utility function)
function listAvailableFonts() {
    var fontList = [];
    for (var i = 0; i < app.textFonts.length; i++) {
        fontList.push(app.textFonts[i].name);
    }
    return fontList;
}

// Run the main function
main();
