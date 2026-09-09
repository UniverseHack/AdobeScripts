// Adobe Illustrator Script: List Top-Level Objects
// Lists the top-level items of the document - groups are reported as a single
// entry (their sub-objects are counted, not listed) alongside standalone objects.
// Writes a report next to the document and shows a summary.

function listTopLevelObjects() {
    if (app.documents.length === 0) {
        alert("Please open a document first.");
        return;
    }

    var doc = app.activeDocument;
    var lines = [];
    var totals = { groups: 0, singles: 0 };

    lines.push("Top-level objects in: " + doc.name);
    lines.push("Artboards: " + doc.artboards.length + "   Layers: " + doc.layers.length);
    lines.push("");

    for (var i = 0; i < doc.layers.length; i++) {
        reportContainer(doc.layers[i], "", lines, totals);
    }

    lines.push("");
    lines.push("TOTAL: " + totals.groups + " group(s), " + totals.singles + " single object(s)");

    var report = lines.join("\n");

    // Save the report beside the document when it has been saved to disk
    var saved = "";
    try {
        var out = new File(doc.path + "/" + doc.name.replace(/\.ai$/i, "") + "_objects.txt");
        out.encoding = "UTF-8";
        out.open("w");
        out.write(report);
        out.close();
        saved = "\n\nWritten to:\n" + out.fsName;
    } catch (e) {
        saved = "\n\n(Document not saved yet - report not written to disk.)";
    }

    alert(report.length > 3000 ? report.substr(0, 3000) + "\n..." + saved : report + saved);
}

// Reports the direct children of a layer or sublayer, recursing into sublayers
// only - groups are reported as one line each.
function reportContainer(layer, indent, lines, totals) {
    lines.push(indent + "LAYER: " + layer.name +
               (layer.visible ? "" : " [hidden]") +
               (layer.locked ? " [locked]" : ""));

    var items = layer.pageItems;
    var count = 0;

    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (!isDirectChild(item, layer)) continue; // skip anything nested in a group
        count++;
        lines.push(indent + "  " + describe(item));
        if (item.typename === "GroupItem") totals.groups++;
        else totals.singles++;
    }

    if (count === 0) lines.push(indent + "  (empty)");

    for (var j = 0; j < layer.layers.length; j++) {
        reportContainer(layer.layers[j], indent + "  ", lines, totals);
    }
}

// True when the item sits directly on the layer rather than inside a group.
function isDirectChild(item, layer) {
    var p = item.parent;
    return p.typename === "Layer" && p === layer;
}

function describe(item) {
    var kind = item.typename === "GroupItem" ? "GROUP" : item.typename.replace(/Item$/, "");
    var name = item.name !== "" ? '"' + item.name + '"' : "(unnamed)";
    var extra = "";

    if (item.typename === "GroupItem") {
        extra = " - " + directCount(item) + " direct, " + countAll(item) + " total sub-object(s)" +
                (item.clipped ? ", clipping group" : "");
    } else if (item.typename === "TextFrame") {
        var t = item.contents.replace(/[\r\n]+/g, " ");
        extra = ' - "' + (t.length > 40 ? t.substr(0, 40) + "..." : t) + '"';
    } else if (item.typename === "PathItem") {
        extra = " - " + item.pathPoints.length + " points" + (item.closed ? ", closed" : ", open");
    }

    var b = item.visibleBounds; // left, top, right, bottom in points
    var size = " [" + pt(b[2] - b[0]) + " x " + pt(b[1] - b[3]) + " in]";

    return kind + ": " + name + extra + size +
           (item.hidden ? " [hidden]" : "") +
           (item.locked ? " [locked]" : "");
}

// Children sitting directly in the group (not inside a nested group).
function directCount(group) {
    var n = 0;
    for (var i = 0; i < group.pageItems.length; i++) {
        if (group.pageItems[i].parent === group) n++;
    }
    return n;
}

// Every descendant of the group, however deeply nested.
function countAll(group) {
    var n = 0;
    for (var i = 0; i < group.pageItems.length; i++) {
        var child = group.pageItems[i];
        if (child.parent !== group) continue;
        n++;
        if (child.typename === "GroupItem") n += countAll(child);
    }
    return n;
}

function pt(points) {
    return Math.round((points / 72) * 100) / 100;
}

listTopLevelObjects();
