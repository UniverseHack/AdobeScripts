// Create square thumbnail from PNG image in Adobe Illustrator
// Crops from top if image is not square
// Default size: 250x250 pixels

// Get user input for thumbnail size
var thumbnailSize = prompt("Enter thumbnail size in pixels:", "250");
if (thumbnailSize === null) {
    alert("Script cancelled.");
} else {
    thumbnailSize = parseInt(thumbnailSize);
    if (isNaN(thumbnailSize) || thumbnailSize <= 0) {
        alert("Invalid size entered. Using default 250px.");
        thumbnailSize = 250;
    }
    
    try {
        var doc = app.activeDocument;
        var originalFile = doc.fullName;
        var originalPath = originalFile.parent;
        var originalName = originalFile.name.replace(/\.[^\.]+$/, ''); // Remove extension
        
        // Get the selected image
        var selectedItem = null;
        if (doc.selection.length > 0) {
            selectedItem = doc.selection[0];
        }
        
        if (!selectedItem) {
            alert("No image selected. Please select an image in Illustrator.");
        } else {
            // Get original image bounds
            var bounds = selectedItem.geometricBounds;
            var imageWidth = bounds[2] - bounds[0];
            var imageHeight = bounds[1] - bounds[3];
            
            // Create new document with square dimensions
            var newDoc = app.documents.add(DocumentColorSpace.RGB, thumbnailSize, thumbnailSize);
            
            // Copy the image to new document
            selectedItem.duplicate(newDoc, ElementPlacement.PLACEATBEGINNING);
            var newImage = newDoc.pageItems[0];
            
            // Calculate scaling and positioning for square crop from top
            var scale;
            var offsetX = 0;
            
            if (imageWidth > imageHeight) {
                // Wide image - scale to fit height, crop sides
                scale = (thumbnailSize / imageHeight) * 100;
                newImage.resize(scale, scale);
                
                // Get new bounds after scaling
                var newBounds = newImage.geometricBounds;
                var scaledWidth = newBounds[2] - newBounds[0];
                
                // Center horizontally
                offsetX = (thumbnailSize - scaledWidth) / 2;
                
            } else if (imageHeight > imageWidth) {
                // Tall image - scale to fit width, crop from bottom (keep top)
                scale = (thumbnailSize / imageWidth) * 100;
                newImage.resize(scale, scale);
                
                // Get new bounds after scaling
                var newBounds = newImage.geometricBounds;
                
                // Center horizontally
                offsetX = (thumbnailSize - (newBounds[2] - newBounds[0])) / 2;
                
            } else {
                // Square image - just scale to fit
                scale = (thumbnailSize / imageWidth) * 100;
                newImage.resize(scale, scale);
                
                // Center both ways
                var newBounds = newImage.geometricBounds;
                offsetX = (thumbnailSize - (newBounds[2] - newBounds[0])) / 2;
            }
            
            // Apply positioning - move image to correct position
            var currentBounds = newImage.geometricBounds;
            
            // Calculate how much to move the image
            var moveX = offsetX - currentBounds[0]; // Move to desired X position
            var moveY;
            
            if (imageWidth === imageHeight) {
                // Square image - center both horizontally and vertically
                var targetCenterY = thumbnailSize / 2;
                var currentCenterY = (currentBounds[1] + currentBounds[3]) / 2;
                moveY = targetCenterY - currentCenterY;
            } else {
                // Non-square image - position at top
                moveY = thumbnailSize - currentBounds[1]; // Move top edge to top of artboard
            }
            
            newImage.translate(moveX, moveY);
            
            // Save as PNG
            var saveFile = new File(originalPath + "/" + originalName + "_thumb.png");
            var exportOptions = new ExportOptionsPNG24();
            exportOptions.artBoardClipping = true;
            exportOptions.transparency = false; // Solid background for thumbnails
            exportOptions.horizontalScale = 100;
            exportOptions.verticalScale = 100;
            
            newDoc.exportFile(saveFile, ExportType.PNG24, exportOptions);
            
            // Close thumbnail document without saving
            newDoc.close(SaveOptions.DONOTSAVECHANGES);
            
            alert("Square thumbnail created: " + saveFile.name + " (" + thumbnailSize + " x " + thumbnailSize + "px)");
        }
        
    } catch (error) {
        alert("Error: " + error.message + "\nMake sure you have an image selected in Illustrator.");
    }
}
