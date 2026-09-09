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
    
    // Read words from file so they can be listed in the settings dialog
    var words = readWordsFromFile(wordsFile);
    if (words.length === 0) {
        alert("Error: words.txt file is empty or could not be read.");
        return;
    }

    // Get user preferences for font settings
    var settings = getUserSettings(doc, words);
    if (!settings) {
        return; // User cancelled
    }

    // Create text items on artboard
    var oversized = createTextItems(doc, settings.words, settings);

    var message = "Successfully placed " + settings.words.length + " words on the artboard!";

    // Rotation inflates a word's bounding box, so a thin band can be hard to respect
    if (oversized > 0) {
        message += "\n\n" + oversized + " word(s) were too large for the border band and spill inward." +
                   "\nUse a larger inner border inset or a smaller maximum font size to avoid this.";
    }

    alert(message);
}


// PostScript names of the fonts used in
// C:\Users\David de Hilster\Documents\David\Art\Graphic Art\Bob de Hilster\BobDeHilsterLight.ai
// These are offered at the top of the font picker when they are installed.
var ART_FONTS = [
    "Bepholar-Regular",
    "ChavlerUnfocus-Regular",
    "GustatoryDelight-Regular",
    "OneThinLine",
    "TorpleCapsRegular",
    "CourierNewPS-BoldItalicMT",
    "MyriadPro-Regular"
];

// Function to look up an installed font by its PostScript name, or null if missing
function findFont(postScriptName) {
    try {
        return app.textFonts.getByName(postScriptName);
    } catch (e) {
        return null;
    }
}

// Function to describe a font the way a person reads it, e.g. "Torple Caps - Regular"
function fontLabel(font) {
    var label = font.family;

    if (font.style && font.style !== "") {
        label += " - " + font.style;
    }

    return label;
}

// Function to list the art fonts that are not installed on this machine
function missingArtFonts() {
    var missing = [];

    for (var i = 0; i < ART_FONTS.length; i++) {
        if (!findFont(ART_FONTS[i])) {
            missing.push(ART_FONTS[i]);
        }
    }

    return missing;
}

// Function to build the font picker entries: art fonts first, a separator, then
// every installed font sorted by name. Each entry is {label, name}; a null name
// marks a separator so the dropdown indexes still line up with this array.
function buildFontChoices() {
    var choices = [];
    var usedNames = {};
    var i;

    for (i = 0; i < ART_FONTS.length; i++) {
        var artFont = findFont(ART_FONTS[i]);
        if (artFont) {
            choices.push({ label: fontLabel(artFont) + "  (art)", name: artFont.name });
            usedNames[artFont.name] = true;
        }
    }

    // Collect and alphabetise the remaining installed fonts
    var others = [];
    for (i = 0; i < app.textFonts.length; i++) {
        var font = app.textFonts[i];
        if (!usedNames[font.name]) {
            others.push({ label: fontLabel(font), name: font.name });
        }
    }

    others.sort(function(a, b) {
        if (a.label === b.label) {
            return 0;
        }
        return (a.label < b.label) ? -1 : 1;
    });

    if (choices.length > 0 && others.length > 0) {
        choices.push({ label: "-", name: null });
    }

    for (i = 0; i < others.length; i++) {
        choices.push(others[i]);
    }

    return choices;
}

// Function to reduce the choice list to the labels the dropdown displays
function choiceLabels(choices) {
    var labels = [];

    for (var i = 0; i < choices.length; i++) {
        labels.push(choices[i].label);
    }

    return labels;
}

// Function to pick the initially selected font: first art font, else Arial, else the first entry
function defaultFontIndex(choices) {
    var i;

    for (i = 0; i < choices.length; i++) {
        if (choices[i].name && choices[i].label.indexOf("(art)") !== -1) {
            return i;
        }
    }

    for (i = 0; i < choices.length; i++) {
        if (choices[i].name === "ArialMT" || choices[i].name === "Arial") {
            return i;
        }
    }

    return 0;
}

// Function to read the PostScript name of the font chosen in the dropdown
function selectedFontName(choices, dropdown) {
    var selection = dropdown.selection;

    if (selection && choices[selection.index] && choices[selection.index].name) {
        return choices[selection.index].name;
    }

    return "ArialMT";
}

// Function to create a dedicated, unlocked top-level layer to hold the words.
// Adding the text frames to this layer directly means whatever layer happens to be
// active - locked, hidden, template, or isolated - no longer matters.
function createWordsLayer(doc) {
    var layer = doc.layers.add();

    layer.name = uniqueLayerName(doc, "Word List");
    layer.locked = false;
    layer.visible = true;

    return layer;
}

// Function to build a layer name that is not already used in the document
function uniqueLayerName(doc, baseName) {
    var name = baseName;
    var suffix = 2;

    while (layerNameExists(doc, name)) {
        name = baseName + " " + suffix;
        suffix++;
    }

    return name;
}

// Function to check whether a top-level layer already uses a given name
function layerNameExists(doc, name) {
    for (var i = 0; i < doc.layers.length; i++) {
        if (doc.layers[i].name === name) {
            return true;
        }
    }

    return false;
}

// Helper: parse a number, falling back to a default only when the text is not a number
function parseNumber(text, defaultValue) {
    var value = parseFloat(text);
    return isNaN(value) ? defaultValue : value;
}

// Function to get the active artboard rectangle as {x, y, width, height}
function getActiveArtboardArea(doc) {
    var artboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];
    var rect = artboard.artboardRect; // [left, top, right, bottom]
    var left = rect[0];
    var top = rect[1];
    var right = rect[2];
    var bottom = rect[3];

    return {
        x: left,
        y: bottom,
        width: right - left,
        height: top - bottom
    };
}

// Function to get user settings for font and size
function getUserSettings(doc, words) {
    var dialog = new Window("dialog", "Random Word List Settings");
    dialog.orientation = "column";
    dialog.alignChildren = "fill";

    // Words read from words.txt - all selected by default
    var wordsPanel = dialog.add("panel", undefined, "Words from words.txt");
    wordsPanel.orientation = "column";
    wordsPanel.alignChildren = "fill";
    wordsPanel.margins = 12;

    var wordsList = wordsPanel.add("listbox", undefined, words, { multiselect: true });
    wordsList.preferredSize = [280, 160];

    var wordsButtonGroup = wordsPanel.add("group");
    var selectAllButton = wordsButtonGroup.add("button", undefined, "Select All");
    var selectNoneButton = wordsButtonGroup.add("button", undefined, "Select None");
    var wordsCountLabel = wordsButtonGroup.add("statictext", undefined, "");
    wordsCountLabel.preferredSize.width = 120;

    function getSelectedWords() {
        var selected = [];
        var selection = wordsList.selection;

        if (selection) {
            for (var i = 0; i < selection.length; i++) {
                selected.push(selection[i].text);
            }
        }

        return selected;
    }

    function updateWordsCount() {
        var selection = wordsList.selection;
        var count = selection ? selection.length : 0;
        wordsCountLabel.text = count + " of " + words.length + " selected";
    }

    function selectAllWords() {
        var indices = [];
        for (var i = 0; i < words.length; i++) {
            indices.push(i);
        }
        wordsList.selection = indices;
        updateWordsCount();
    }

    selectAllButton.onClick = selectAllWords;

    selectNoneButton.onClick = function() {
        wordsList.selection = null;
        updateWordsCount();
    };

    wordsList.onChange = updateWordsCount;
    selectAllWords();

    // Font picker - art fonts first, then every installed font
    var fontChoices = buildFontChoices();

    var fontGroup = dialog.add("group");
    fontGroup.add("statictext", undefined, "Font:");
    var fontDropdown = fontGroup.add("dropdownlist", undefined, choiceLabels(fontChoices));
    fontDropdown.preferredSize.width = 260;
    fontDropdown.selection = defaultFontIndex(fontChoices);

    // Note any art fonts that are referenced but not installed on this machine
    var missingFonts = missingArtFonts();
    if (missingFonts.length > 0) {
        var missingLabel = dialog.add("statictext", undefined,
            "Not installed: " + missingFonts.join(", "), { truncate: "end" });
        missingLabel.preferredSize.width = 300;
    }


    // Font size range
    var sizeGroup = dialog.add("group");
    sizeGroup.add("statictext", undefined, "Font Size Range (pt):");
    var minSizeInput = sizeGroup.add("edittext", undefined, "16");
    minSizeInput.characters = 6;
    sizeGroup.add("statictext", undefined, "to");
    var maxSizeInput = sizeGroup.add("edittext", undefined, "48");
    maxSizeInput.characters = 6;
    
    // Use the current artboard as the placement area
    var artboardGroup = dialog.add("group");
    artboardGroup.alignment = "left";
    var useArtboardCheck = artboardGroup.add("checkbox", undefined, "Use current artboard as placement area");
    useArtboardCheck.value = true;

    // Margin inset applied when using the current artboard
    var marginGroup = dialog.add("group");
    var marginLabel = marginGroup.add("statictext", undefined, "Artboard Margin (pt):");
    var marginInput = marginGroup.add("edittext", undefined, "36");
    marginInput.characters = 6;

    // Optional inner border: words are kept in the band between the outer edge
    // of the placement area and this border, leaving the middle empty
    var innerCheckGroup = dialog.add("group");
    innerCheckGroup.alignment = "left";
    var useInnerCheck = innerCheckGroup.add("checkbox", undefined, "Inner border (place words between the borders only)");
    useInnerCheck.value = true;

    var innerGroup = dialog.add("group");
    var innerLabel = innerGroup.add("statictext", undefined, "Inner Border Inset (pt from outer border):");
    var innerInput = innerGroup.add("edittext", undefined, "144");
    innerInput.characters = 6;

    // The band width only matters when the inner border is switched on
    function updateInnerFields() {
        innerLabel.enabled = useInnerCheck.value;
        innerInput.enabled = useInnerCheck.value;
    }

    useInnerCheck.onClick = updateInnerFields;
    updateInnerFields();

    // Artboard area for random placement
    var areaGroup = dialog.add("group");
    var areaLabel = areaGroup.add("statictext", undefined, "Placement Area (X, Y, Width, Height):");
    var areaXInput = areaGroup.add("edittext", undefined, "50");
    areaXInput.characters = 6;
    var areaYInput = areaGroup.add("edittext", undefined, "50");
    areaYInput.characters = 6;
    var areaWInput = areaGroup.add("edittext", undefined, "700");
    areaWInput.characters = 6;
    var areaHInput = areaGroup.add("edittext", undefined, "500");
    areaHInput.characters = 6;

    // Enable only the fields that apply to the selected placement mode
    function updateAreaFields() {
        var useArtboard = useArtboardCheck.value;
        marginLabel.enabled = useArtboard;
        marginInput.enabled = useArtboard;
        areaLabel.enabled = !useArtboard;
        areaXInput.enabled = !useArtboard;
        areaYInput.enabled = !useArtboard;
        areaWInput.enabled = !useArtboard;
        areaHInput.enabled = !useArtboard;
    }

    useArtboardCheck.onClick = updateAreaFields;
    updateAreaFields();

    // Buttons
    var buttonGroup = dialog.add("group");
    buttonGroup.alignment = "center";
    var okButton = buttonGroup.add("button", undefined, "OK");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    // Event handlers
    okButton.onClick = function() {
        if (getSelectedWords().length === 0) {
            alert("Please select at least one word from the list.");
            return;
        }
        dialog.close(1);
    };
    
    cancelButton.onClick = function() {
        dialog.close(0);
    };
    
    // Show dialog
    var result = dialog.show();
    
    if (result === 1) {
        var areaX, areaY, areaWidth, areaHeight;

        if (useArtboardCheck.value) {
            var margin = parseNumber(marginInput.text, 0);
            var area = getActiveArtboardArea(doc);

            areaX = area.x + margin;
            areaY = area.y + margin;
            areaWidth = area.width - (margin * 2);
            areaHeight = area.height - (margin * 2);

            // Guard against a margin larger than the artboard itself
            if (areaWidth < 0 || areaHeight < 0) {
                alert("The margin is too large for the current artboard.\nArtboard size: " +
                      area.width + " x " + area.height + " pt.");
                return null;
            }
        } else {
            areaX = parseNumber(areaXInput.text, 50);
            areaY = parseNumber(areaYInput.text, 50);
            areaWidth = parseNumber(areaWInput.text, 700);
            areaHeight = parseNumber(areaHInput.text, 500);
        }

        var bandWidth = 0;
        if (useInnerCheck.value) {
            bandWidth = parseNumber(innerInput.text, 0);

            if (bandWidth <= 0) {
                alert("The inner border inset must be greater than 0 pt.");
                return null;
            }

            // An inset past the middle would leave no hole at all
            if (bandWidth * 2 >= areaWidth || bandWidth * 2 >= areaHeight) {
                alert("The inner border inset is too large for the placement area.\n" +
                      "Placement area: " + areaWidth + " x " + areaHeight + " pt, so the inset must stay under " +
                      (Math.min(areaWidth, areaHeight) / 2) + " pt.");
                return null;
            }
        }

        return {
            words: getSelectedWords(),
            fontFamily: selectedFontName(fontChoices, fontDropdown),
            minFontSize: parseNumber(minSizeInput.text, 16),
            maxFontSize: parseNumber(maxSizeInput.text, 48),
            areaX: areaX,
            areaY: areaY,
            areaWidth: areaWidth,
            areaHeight: areaHeight,
            bandWidth: bandWidth
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

// Function to split the placement area into the four strips that make up the band
// between its outer edge and the inner border. Returns rectangles as {x, y, width, height}.
function buildBandRects(settings) {
    var band = settings.bandWidth;
    var x = settings.areaX;
    var y = settings.areaY;
    var w = settings.areaWidth;
    var h = settings.areaHeight;

    // anchorX / anchorY say which edge of the strip a word hugs when it is too big
    // for the strip: -1 = low edge, 0 = centred, 1 = high edge. Anchoring to the
    // outer edge means an oversized word spills inward, never off the artboard.
    return [
        { x: x, y: y + h - band, width: w, height: band, anchorX: 0, anchorY: 1 },   // top
        { x: x, y: y, width: w, height: band, anchorX: 0, anchorY: -1 },             // bottom
        { x: x, y: y + band, width: band, height: h - (band * 2), anchorX: -1, anchorY: 0 },           // left
        { x: x + w - band, y: y + band, width: band, height: h - (band * 2), anchorX: 1, anchorY: 0 }  // right
    ];
}

// Function to pick one strip at random from a matching set of weights
function pickWeighted(rects, weights, total) {
    var target = Math.random() * total;

    for (var i = 0; i < rects.length; i++) {
        target -= weights[i];
        if (target <= 0) {
            return rects[i];
        }
    }

    return rects[rects.length - 1];
}

// Function to choose one of the band strips for an item. Strips the item fits in
// are weighted by how much room they leave, which spreads words evenly around the
// band. When it fits nowhere - a long word rotated to 45 degrees has a big bounding
// box - the least cramped strip is favoured instead, so the word still hugs the
// band rather than landing in the middle of the artboard.
function pickBandRect(rects, width, height) {
    var fitWeights = [];
    var fitTotal = 0;
    var nearWeights = [];
    var nearTotal = 0;
    var i;

    for (i = 0; i < rects.length; i++) {
        var spanX = rects[i].width - width;
        var spanY = rects[i].height - height;

        // +1 on each span keeps a strip that only just fits from being unreachable
        var fit = (spanX >= 0 && spanY >= 0) ? (spanX + 1) * (spanY + 1) : 0;
        fitWeights.push(fit);
        fitTotal += fit;

        // How far the item pokes out of this strip, ignoring the directions that fit
        var overflow = Math.max(0, -spanX) + Math.max(0, -spanY);
        var near = 1 / ((1 + overflow) * (1 + overflow));
        nearWeights.push(near);
        nearTotal += near;
    }

    if (fitTotal > 0) {
        return pickWeighted(rects, fitWeights, fitTotal);
    }

    return pickWeighted(rects, nearWeights, nearTotal);
}

// Helper: pick a random coordinate inside a span, or, when the item is bigger than
// the span, offset it by the anchor (-1 low edge, 0 centred, 1 high edge)
function offsetWithinSpan(start, span, anchor) {
    if (span > 0) {
        return start + Math.random() * span;
    }

    if (anchor < 0) {
        return start;          // hug the low edge
    }

    if (anchor > 0) {
        return start + span;   // hug the high edge
    }

    return start + (span / 2); // centre, spilling equally both ways
}

// Function to move an item so its whole bounding box sits inside a rectangle,
// anchoring it against the rectangle's edges when it is too big to fit.
// Returns true when the item fits entirely inside the rectangle.
function placeWithinRect(item, rect) {
    var bounds = item.visibleBounds; // [left, top, right, bottom]
    var width = bounds[2] - bounds[0];
    var height = bounds[1] - bounds[3];

    // How much room is left once the item's own size is accounted for
    var spanX = rect.width - width;
    var spanY = rect.height - height;

    var left = offsetWithinSpan(rect.x, spanX, rect.anchorX ? rect.anchorX : 0);
    var bottom = offsetWithinSpan(rect.y, spanY, rect.anchorY ? rect.anchorY : 0);

    // translate() is relative, which avoids any ambiguity about what position refers to
    item.translate(left - bounds[0], (bottom + height) - bounds[1]);

    return (spanX >= 0 && spanY >= 0);
}

// Function to move an item into the placement area: anywhere inside it normally,
// or inside the band between the outer border and the inner border when one is set.
// Returns true when the item fits entirely inside wherever it was placed.
function placeWithinArea(item, settings) {
    if (settings.bandWidth > 0) {
        var bounds = item.visibleBounds; // [left, top, right, bottom]
        var strip = pickBandRect(buildBandRects(settings),
                                 bounds[2] - bounds[0],
                                 bounds[1] - bounds[3]);

        return placeWithinRect(item, strip);
    }

    return placeWithinRect(item, {
        x: settings.areaX,
        y: settings.areaY,
        width: settings.areaWidth,
        height: settings.areaHeight
    });
}

// Function to create text items on artboard with random placement, rotation and
// size. Returns the number of words too large to fit their placement rectangle.
function createTextItems(doc, words, settings) {
    // Everything the script creates goes into its own layer
    var wordsLayer = createWordsLayer(doc);
    var oversized = 0;

    for (var i = 0; i < words.length; i++) {
        var textFrame = wordsLayer.textFrames.add();
        textFrame.contents = words[i];

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

        // Rotate before positioning - rotation changes the bounding box size
        var randomRotation = Math.random() * 360;
        textFrame.rotate(randomRotation);

        // Position last, once the final size and rotation are known
        if (!placeWithinArea(textFrame, settings)) {
            oversized++;
        }
    }

    // Note: Removing auto-fit as words are now randomly placed across the artboard

    return oversized;
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
