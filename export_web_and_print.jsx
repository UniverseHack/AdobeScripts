// Illustrator dual-export script
// Save as: export_web_and_print.jsx

var doc = app.activeDocument;
var docPath = doc.path;

// Set PNG export to optimize for art and use artboard 1
doc.artboards.setActiveArtboardIndex(0);

// --- Web export settings ---
// Set PNG export to optimize for art
// Set PNG export to optimize for art and use artboard 1

var webOptions = new ExportOptionsPNG24();
webOptions.antiAliasing = true;
webOptions.artBoardClipping = true;
webOptions.transparency = false;
webOptions.horizontalScale = 100;
webOptions.verticalScale = 100;

// --- Print export settings ---
var printOptions = new ExportOptionsPNG24();
printOptions.antiAliasing = true;
printOptions.artBoardClipping = true;
printOptions.transparency = false;
printOptions.horizontalScale = 416.67; // 300 dpi relative to 72 dpi
printOptions.verticalScale = 416.67;

// --- Output paths ---
var webFile = new File(docPath + "/" + doc.name.replace(".ai","") + "_web.png");
var printFile = new File(docPath + "/" + doc.name.replace(".ai","") + "_print.png");

// --- Export ---
// Ensure files can be overwritten
if (webFile.exists) webFile.remove();
if (printFile.exists) printFile.remove();

doc.exportFile(webFile, ExportType.PNG24, webOptions);
doc.exportFile(printFile, ExportType.PNG24, printOptions);

alert("Export complete!");