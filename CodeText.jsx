/*
 * CodeText Script for Adobe Illustrator
 * Renders source code as syntax-colored text on a dark background,
 * ready to drop into the book as a figure.
 *
 * Pick a file and a function from the dialog; the script extracts that
 * function's source and lays it out as a single point text frame with
 * per-token coloring, plus a background rectangle.
 *
 * Languages and where their dark colors come from:
 *   .jsx .js         JavaScript / ExtendScript   VS Code Dark+
 *   .nlp .pat        NLP++ pass                  NLP++ extension + settings.json
 *   .tree            NLP++ parse tree            settings.json [*Dark*]
 *   .kbb .kb .dict   NLP++ knowledge / lexicon   settings.json [*Dark*]
 *   .seq             NLP++ analyzer sequence     VS Code Dark+
 *   .txxt            NLP++ text                  settings.json [*Dark*]
 *
 * The NLP++ token sets are lifted from the grammars that ship with the
 * dehilster.nlp VS Code extension, and the background (#1E1E1E) and default
 * foreground (#D4D4D4) are that extension's own themes/dark_defaults.json.
 *
 * Author: Adobe Scripts Collection
 * Date: 2026
 */

#target illustrator

// ---------------------------------------------------------------- palette
// VS Code Dark+ (dark_plus / dark_vs) token colors
var THEME = {
    'background': '1E1E1E',
    'lineNumber': '858585',
    'text':       'D4D4D4',
    'keyword':    '569CD6',   // var, function, new, typeof, true, null, this
    'control':    'C586C0',   // if, else, for, while, return, ...
    'funcName':   'DCDCAA',   // declarations and call sites
    'variable':   '9CDCFE',   // identifiers, parameters, properties
    'type':       '4EC9B0',   // constructors / built-in objects
    'number':     'B5CEA8',
    'string':     'CE9178',
    'comment':    '6A9955',
    'operator':   'D4D4D4'
};

var KW_CONTROL = ',if,else,for,while,do,return,break,continue,switch,case,default,try,catch,finally,throw,';
var KW_OTHER   = ',var,let,const,function,new,delete,typeof,instanceof,in,void,with,true,false,null,undefined,this,NaN,Infinity,';
var WHOLE_FILE = '<entire file>';

var KW_TYPE    = ',RGBColor,CMYKColor,GrayColor,Math,Object,Array,String,Number,Boolean,Date,RegExp,File,Folder,Window,ScriptUI,app,';

// ------------------------------------------------------------ NLP++ palette
// The background and default foreground are the NLP++ extension's own
// themes/dark_defaults.json. Colors marked (settings) are the ones the user's
// .vscode/settings.json sets under "[*Dark*]"; the rest follow VS Code Dark+
// for the nearest generic scope, since the extension ships no token colors.
var NLP_THEME = {
    'region':     'C586C0',   // CODE RULES DECL markers and their terminators
    'keyword':    'C586C0',   // if else while return cout ...
    'constant':   '569CD6',   // _ROOT, _xWILD, _xALPHA ...
    'wordOp':     '569CD6',   // and or not in
    'letterFunc': 'DC1B1B',   // G N S X L                          (settings)
    'funcName':   '8F8F8F',   // engine functions, bold in the IDE  (settings)
    'parameter':  'F8FA87',   // _variables                         (settings)
    'attribute':  'F293FB',   // attr opt star plus s t ...         (settings)
    'rewrite':    '9CDCFE',   // the _node being built, left of <-
    'number':     'B5CEA8',
    'string':     'CE9178',
    'comment':    '6A9955'
};

var TREE_THEME = {
    'node':      '4E8E3C',   // (settings) keyword.node.tree
    'rewrite':   'F8FA87',   // (settings) keyword.rewrite.tree
    'fired':     'DC1B1B',   // (settings) keyword.fired.tree
    'number':    '93BFFB',   // (settings) constant.numeric.tree
    'attribute': 'F293FB',
    'string':    'CE9178',
    'comment':   '6A9955'
};

var KBB_THEME = {
    'top':       '896EFF',   // (settings) keyword.other.kbb  - column 0 concept
    'concept':   'E3EE50',   // (settings) keyword.concept.kbb  - indent 2
    'concept1':  '2EB657',   // (settings) keyword.concept.kbb1 - indent 4
    'concept2':  'E049D9',   // (settings) keyword.concept.kbb2 - indent 6+
    'attribute': '93BFFB',   // (settings) constant.numeric.tree, used for name=
    'number':    'B5CEA8',
    'string':    'CE9178',
    'comment':   '6A9955'
};

var TXXT_THEME = {
    'text':      '7E7E7E',   // (settings) source.txxt is the base color here
    'keyword':   '569CD6',   // <<< >>>
    'parameter': 'F8FA87',   // (settings) variable.parameter.txxt
    'comment':   '6A9955'    // ((( )))
};

var MISC_THEME = {
    'keyword':   '569CD6',   // .kb and .seq keywords
    'parameter': 'F8FA87',   // (settings) variable.parameter.nlp, reused by .kb
    'word':      'DCDCAA',   // the headword in a .dict entry
    'attribute': '569CD6',   // name= in .dict
    'number':    'B5CEA8',
    'string':    'CE9178',
    'comment':   '6A9955',
    'operator':  'D4D4D4'
};

// The NLP++ VS Code extension, whose folder carries its version number
// (dehilster.nlp-3.12.20). Several versions are usually installed side by
// side, so the newest one is worked out at run time rather than hardcoded.
var NLP_EXTENSION = 'dehilster.nlp';
var VSCODE_EXTENSION_DIRS = ['~/.vscode/extensions', '~/.vscode-insiders/extensions'];

// NLP++ engine functions -- 320 entries, taken from entity.name.function.nlp
var NLP_FUNCS = ','
    + 'abs,addarg,addattr,addcnode,addconcept,addconval,addnode,addnumval,addstmt,addstrs,addstrval,'
    + 'addsval,addword,arraylength,attrchange,attrexists,attrname,attrtype,attrvals,attrwithval,'
    + 'batchstart,cap,cbuf,ceiling,closefile,conceptname,conceptpath,conval,cout,coutreset,dballocstmt,'
    + 'dbbindcol,dbclose,dbexec,dbexecstmt,dbfetch,dbfreestmt,dbopen,deaccent,debug,dictfindword,'
    + 'dictfirst,dictgetword,dictnext,down,else,eltnode,excise,exitpass,exittopopup,factorial,fail,'
    + 'fileout,findana,findattr,findattrs,findconcept,findhierconcept,findnode,findphrase,findroot,'
    + 'findvals,findwordpath,firstnode,floor,flt,fltval,fncallstart,fprintgvar,fprintnvar,fprintxvar,'
    + 'fprintvar,gdump,getconcept,getconval,getnumval,getpopupdata,getstrval,getsval,ginc,gp,group,'
    + 'gtolower,guniq,hitconf,if,inc,inheritval,inputrange,inputrangetofile,interactive,kbdumptree,'
    + 'lasteltnode,lastnode,length,lengthr,levenshtein,lextagger,listadd,listnode,LJ,lj,log,logten,'
    + 'lookup,lowercase,makeconcept,makeparentconcept,makephrase,makestmt,merge,merger,mkdir,mod,'
    + 'movecleft,movecright,movesem,ndump,next,nextattr,nextval,ninc,nodeconcept,nodeowner,noop,num,'
    + 'numrange,numval,openfile,or,pathconcept,percentstr,permuten,phraselength,phraseraw,phrasetext,'
    + 'pncopyvars,pndown,pninsert,pnmakevar,pnname,pnnext,pnprev,pnreplaceval,pnroot,pnsingletdown,'
    + 'pnup,pnvar,pnvarnames,pow,pranchor,prchild,preaction,printvar,pndeletechilds,pnrename,prev,'
    + 'print,printr,prlit,prrange,prtree,prunephrases,prxtree,randomint,regexp,regexpi,renameattr,'
    + 'renamechild,renameconcept,renamenode,replaceval,resolveurl,return,returnstmt,rfaaction,'
    + 'rfaactions,rfaarg,rfaargtolist,rfacode,rfaelement,rfaelt,rfaexpr,rfalist,rfalitelt,'
    + 'rfalittoaction,rfalittopair,rfaname,rfanodes,rfanonlit,rfanonlitelt,rfanum,rfaop,rfapair,'
    + 'rfapairs,rfapostunary,rfapres,rfarange,rfarecurse,rfarecurses,rfaregion,rfaregions,rfarule,'
    + 'rfarulelts,rfarulemark,rfarules,rfarulesfile,rfaselect,rfastr,rfasugg,rfaunary,rfavar,rfbarg,'
    + 'rfbdecl,rfbdecls,rightjustifynum,rmattr,rmattrs,rmattrval,rmchild,rmchildren,rmconcept,'
    + 'rmcphrase,rmnode,rmphrase,rmval,rmvals,rmword,round,sdump,setbase,setlookahead,setunsealed,'
    + 'single,singler,singlex,singlezap,sortconsbyattr,sortchilds,sorthier,sortphrase,sortvals,'
    + 'spellcandidates,spellcorrect,spellword,splice,split,sqlstr,sqrt,startout,stem,stopout,str,'
    + 'strchar,strchr,strchrcount,strclean,strcontains,strcontainsnocase,strendswith,strequal,'
    + 'strequalnocase,strescape,strunescape,strgreaterthan,strisalpha,strisdigit,strislower,'
    + 'strisupper,strlength,strlessthan,strnotequal,strnotequalnocase,strpiece,strrchr,'
    + 'strspellcandidate,strspellcompare,strstartswith,strsubst,strtolower,strtotitle,strtoupper,'
    + 'strtrim,strval,strwrap,succeed,suffix,system,take,today,topdir,truncate,unknown,unpackdirs,up,'
    + 'uppercase,urlbase,urltofile,var,vareq,varfn,varfnarray,varinlist,varne,varstrs,varz,wninit,'
    + 'wnsensestoconcept,wnhypnymstoconcept,while,whilestmt,wordindex,wordpath,writekb,xaddlen,'
    + 'xaddnvar,xdump,xinc,xmlstr,xrename,';

// Rule element attributes -- 39 entries, taken from keyword.attribute.nlp
var NLP_ATTRS = ','
    + 'attr,attrs,da,deacc,deaccent,except,excepts,fail,fails,gp,group,layer,layers,look,lookahead,'
    + 'match,matches,max,min,nest,o,one,opt,option,optional,pass,passes,plus,recurse,ren,rename,s,'
    + 'singlet,star,t,tree,trig,trigger,unsealed,';

// Statement keywords -- 9 entries, taken from keyword.other.nlp
var NLP_KEYWORDS = ',cap,cout,else,gp,group,if,inc,return,while,';

// Word operators -- 4 entries, taken from keyword.operator.word.nlp
var NLP_WORDOPS = ',and,not,or,in,';

// Pass regions -- 9 entries, taken from keyword.region.nlp
var NLP_REGIONS = ',CHECK,CODE,DECL,MULTI,NODES,PATH,POST,PRE,RULES,';

// Built-in constants and wildcards -- taken from keyword.constants.nlp
var NLP_CONSTANTS = ',_ROOT,_xWILD,_xNUM,_xALPHA,_xWHITE,_xNIL,_xSTART,_xEND,_xCTRL,';

// .kb and .seq keyword sets, from kb.tmLanguage.json and seq.tmLanguage.json
var KB_ACTIONS  = ',add,bind,ind,quit,take,';
var KB_KEYWORDS = ',attr,end,empty,hier,no_ptr,pchar,pcon,pfloat,pnum,pptr,psym,pst,root,word,sys,';
// seq.tmLanguage.json only lists pat|rec|tokenize|dicttokz, but every
// analyzer.seq in the engine also starts lines with nlp and stub, so those
// are included here to keep a sequence listing from looking half-colored.
var SEQ_KEYWORDS = ',pat,rec,tokenize,dicttokz,nlp,stub,';
var TREE_ATTRS   = ',alpha,ctrl,emoji,node,num,punct,white,';

// ---------------------------------------------------------------- entry
function main() {
    if (app.documents.length === 0) {
        alert('Please open a document in Illustrator before running this script.');
        return;
    }

    var settings = getUserSettings();
    if (!settings) return;                       // cancelled

    var source = readTextFile(settings.file);
    if (source === null) {
        alert('Could not read:\n' + settings.file.fsName);
        return;
    }

    var code, title;
    if (settings.funcName === WHOLE_FILE) {
        code = trimBlankEdges(source);
        title = settings.file.name;
    } else {
        code = extractFunction(source, settings.funcName, settings.lang);
        if (code === null) {
            alert('Could not find "' + settings.funcName + '" in that file.');
            return;
        }
        title = settings.funcName;
    }

    drawCodeBlock(app.activeDocument, code, settings, title);
}

// ---------------------------------------------------------------- dialog
function getUserSettings() {
    var scriptFolder = new File($.fileName).parent;
    var startFile = new File(scriptFolder + '/TPM.jsx');
    if (!startFile.exists) startFile = null;

    var fonts = monoFonts();

    var dlg = new Window('dialog', 'Code Text - Dark Mode');
    dlg.orientation = 'column';
    dlg.alignChildren = 'fill';

    // --- source file
    var fileGroup = dlg.add('panel', undefined, 'Source');
    fileGroup.orientation = 'column';
    fileGroup.alignChildren = 'fill';
    fileGroup.margins = 12;

    var row1 = fileGroup.add('group');
    row1.add('statictext', undefined, 'File:');
    var fileText = row1.add('edittext', undefined, startFile ? startFile.fsName : '');
    fileText.characters = 44;

    var row1b = fileGroup.add('group');
    var jsBtn = row1b.add('button', undefined, 'Browse JavaScript...');
    var nlpBtn = row1b.add('button', undefined, 'Browse NLP++...');
    var langText = row1b.add('statictext', undefined, '', { truncate: 'middle' });
    langText.preferredSize.width = 200;

    var row2 = fileGroup.add('group');
    row2.add('statictext', undefined, 'Function:');
    var funcList = row2.add('dropdownlist', undefined, []);
    funcList.preferredSize.width = 260;

    var currentLang = 'text';

    function loadFunctions(f) {
        currentLang = detectLanguage(f);
        langText.text = 'Language: ' + languageLabel(currentLang);

        funcList.removeAll();
        funcList.add('item', WHOLE_FILE);        // many of these files have no outline
        var src = f ? readTextFile(f) : null;
        if (src !== null) {
            var names = listFunctionNames(src, currentLang);
            for (var i = 0; i < names.length; i++) funcList.add('item', names[i]);
        }
        funcList.selection = (funcList.items.length > 1) ? 1 : 0;
    }
    loadFunctions(startFile);

    // Both buttons open the same file browser, just parked somewhere useful:
    // this one on the folder holding the Illustrator scripts.
    jsBtn.onClick = function () {
        var picked = browseFrom(scriptFolder, 'Select a script file');
        if (picked) {
            fileText.text = picked.fsName;
            loadFunctions(picked);
        }
    };

    // ... and this one on the NLP++ analyzers folder inside the extension.
    nlpBtn.onClick = function () {
        var analyzers = nlpAnalyzersFolder();
        if (!analyzers) {
            alert('Could not find the NLP++ extension under\n' +
                  '  ~/.vscode/extensions/' + NLP_EXTENSION + '-<version>\n\n' +
                  'Opening the file browser instead.');
        }
        var picked = browseFrom(analyzers, 'Select an NLP++ file');
        if (picked) {
            fileText.text = picked.fsName;
            loadFunctions(picked);
        }
    };

    // --- type
    var typeGroup = dlg.add('panel', undefined, 'Type');
    typeGroup.orientation = 'column';
    typeGroup.alignChildren = 'left';
    typeGroup.margins = 12;

    var row3 = typeGroup.add('group');
    row3.add('statictext', undefined, 'Font:');
    var fontList = row3.add('dropdownlist', undefined, fonts.names);
    fontList.preferredSize.width = 220;
    fontList.selection = 0;

    var row4 = typeGroup.add('group');
    row4.add('statictext', undefined, 'Size (pt):');
    var sizeInput = row4.add('edittext', undefined, '9');
    sizeInput.characters = 5;
    row4.add('statictext', undefined, 'Line spacing:');
    var leadInput = row4.add('edittext', undefined, '1.35');
    leadInput.characters = 5;
    row4.add('statictext', undefined, 'Tab = spaces:');
    var tabInput = row4.add('edittext', undefined, '4');
    tabInput.characters = 5;

    // --- layout
    var layoutGroup = dlg.add('panel', undefined, 'Layout');
    layoutGroup.orientation = 'column';
    layoutGroup.alignChildren = 'left';
    layoutGroup.margins = 12;

    var bgCheck = layoutGroup.add('checkbox', undefined, 'Dark background rectangle (#' + THEME.background + ')');
    bgCheck.value = true;
    var numCheck = layoutGroup.add('checkbox', undefined, 'Line numbers');
    numCheck.value = true;

    var row5 = layoutGroup.add('group');
    row5.add('statictext', undefined, 'Padding (pt):');
    var padInput = row5.add('edittext', undefined, '14');
    padInput.characters = 5;

    // --- buttons
    var btns = dlg.add('group');
    btns.alignment = 'right';
    btns.add('button', undefined, 'Cancel', { name: 'cancel' });
    btns.add('button', undefined, 'OK', { name: 'ok' });

    if (dlg.show() !== 1) return null;

    var file = new File(fileText.text);
    if (!file.exists) {
        alert('File not found:\n' + fileText.text);
        return null;
    }
    if (!funcList.selection) {
        alert('Please choose a function.');
        return null;
    }

    return {
        file: file,
        lang: detectLanguage(file),
        funcName: funcList.selection.text,
        font: fonts.fonts[fontList.selection.index],
        size: toNumber(sizeInput.text, 9),
        leading: toNumber(leadInput.text, 1.35),
        tabWidth: Math.round(toNumber(tabInput.text, 4)),
        background: bgCheck.value,
        lineNumbers: numCheck.value,
        padding: toNumber(padInput.text, 14)
    };
}

function toNumber(str, fallback) {
    var n = parseFloat(str);
    return (isNaN(n) || n <= 0) ? fallback : n;
}

// Collect monospaced fonts, preferred ones first, then everything else.
function monoFonts() {
    var preferred = ['Consolas', 'CourierNewPSMT', 'Menlo-Regular', 'Monaco',
                     'SourceCodePro-Regular', 'RobotoMono-Regular', 'DejaVuSansMono'];
    var hints = ['mono', 'consol', 'courier', 'menlo', 'monaco', 'code'];
    var names = [], objs = [], seen = {}, i, j;

    for (i = 0; i < preferred.length; i++) {
        try {
            var f = app.textFonts.getByName(preferred[i]);
            if (f && !seen[f.name]) { seen[f.name] = true; names.push(f.name); objs.push(f); }
        } catch (e) {}
    }
    for (i = 0; i < app.textFonts.length; i++) {
        var font = app.textFonts[i];
        if (seen[font.name]) continue;
        var lower = font.name.toLowerCase();
        for (j = 0; j < hints.length; j++) {
            if (lower.indexOf(hints[j]) !== -1) {
                seen[font.name] = true;
                names.push(font.name);
                objs.push(font);
                break;
            }
        }
    }
    if (names.length === 0) {                    // no mono font found: offer all
        for (i = 0; i < app.textFonts.length; i++) {
            names.push(app.textFonts[i].name);
            objs.push(app.textFonts[i]);
        }
    }
    return { names: names, fonts: objs };
}

// Open the file browser starting in `folder`, falling back to wherever
// Illustrator last was if that folder is missing. Returns null on cancel.
function browseFrom(folder, prompt) {
    if (folder && folder.exists) {
        // openDlg on a Folder opens the browser inside that folder
        try { return folder.openDlg(prompt); } catch (e) {}
    }
    return File.openDialog(prompt);
}

// The analyzers folder of the newest installed NLP++ extension, or null.
// Version folders sort numerically, not alphabetically, so that 3.12.9 does
// not come out ahead of 3.12.20.
function nlpAnalyzersFolder() {
    var newest = null, newestVersion = null;
    var d, i;

    for (d = 0; d < VSCODE_EXTENSION_DIRS.length; d++) {
        var root = new Folder(VSCODE_EXTENSION_DIRS[d]);
        if (!root.exists) continue;

        var found = root.getFiles(NLP_EXTENSION + '-*');
        if (!found) continue;

        for (i = 0; i < found.length; i++) {
            if (!(found[i] instanceof Folder)) continue;
            var version = versionOf(decodeURI(found[i].name));
            if (!newestVersion || compareVersions(version, newestVersion) > 0) {
                newestVersion = version;
                newest = found[i];
            }
        }
    }
    if (!newest) return null;

    // Prefer the analyzers folder, but settle for whatever of the path exists.
    var candidates = ['/nlp-engine/analyzers', '/nlp-engine', ''];
    for (i = 0; i < candidates.length; i++) {
        var f = new Folder(newest.fsName + candidates[i]);
        if (f.exists) return f;
    }
    return null;
}

// "dehilster.nlp-3.12.20" -> [3, 12, 20]
function versionOf(folderName) {
    var dash = folderName.lastIndexOf('-');
    var parts = (dash === -1) ? [] : folderName.substring(dash + 1).split('.');
    var out = [];
    for (var i = 0; i < parts.length; i++) {
        var n = parseInt(parts[i], 10);
        out.push(isNaN(n) ? 0 : n);
    }
    return out;
}

function compareVersions(a, b) {
    var len = Math.max(a.length, b.length);
    for (var i = 0; i < len; i++) {
        var x = (i < a.length) ? a[i] : 0;
        var y = (i < b.length) ? b[i] : 0;
        if (x !== y) return (x > y) ? 1 : -1;
    }
    return 0;
}

// ---------------------------------------------------------------- source
function readTextFile(file) {
    if (!file || !file.exists) return null;
    file.open('r');
    var content = file.read();
    file.close();
    return content;
}

// Blank out the contents of comments and string literals, keeping the string
// the same length so every index still maps back to the original source.
// Everything downstream scans this masked copy, so a "function foo(" written
// inside a comment or a string is never mistaken for a declaration.
function maskLiterals(source) {
    var out = [];
    var i = 0;
    var len = source.length;

    function blank(c) { return (c === '\n' || c === '\r') ? c : ' '; }

    while (i < len) {
        var c = source.charAt(i);
        var next = source.charAt(i + 1);

        if (c === '/' && next === '/') {
            while (i < len && source.charAt(i) !== '\n') { out.push(blank(source.charAt(i))); i++; }
            continue;
        }
        if (c === '/' && next === '*') {
            out.push(' ', ' ');
            i += 2;
            while (i < len && !(source.charAt(i) === '*' && source.charAt(i + 1) === '/')) {
                out.push(blank(source.charAt(i)));
                i++;
            }
            if (i < len) { out.push(' ', ' '); i += 2; }
            continue;
        }
        if (c === '"' || c === "'") {
            out.push(' ');
            i++;
            while (i < len) {
                if (source.charAt(i) === '\\') {
                    out.push(' ');
                    if (i + 1 < len) out.push(blank(source.charAt(i + 1)));
                    i += 2;
                    continue;
                }
                if (source.charAt(i) === c) { out.push(' '); i++; break; }
                out.push(blank(source.charAt(i)));
                i++;
            }
            continue;
        }
        out.push(c);
        i++;
    }
    return out.join('');
}

// Find every function in the source, in all the forms these scripts use:
//   function name(...) {}          declaration, at any nesting depth
//   var name = function(...) {}    assignment
//   name = function(...) {}        assignment to an existing name or property
//   name : function(...) {}        object literal method, as in fieldCanvas()
// Returns [{name, start, end}] with end just past the closing brace.
function scanFunctions(source, lang) {
    if (lang === 'nlp') return scanNLP(source);
    if (lang && lang !== 'js') return [];        // the rest have no outline
    return scanJS(source);
}

function scanJS(source) {
    var masked = maskLiterals(source);
    var patterns = [
        /function\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g,
        /(?:var\s+)?([A-Za-z_$][A-Za-z0-9_$.]*)\s*=\s*function\s*\(/g,
        /([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*function\s*\(/g
    ];

    var found = [];
    var byBrace = {};
    var p, m;

    for (p = 0; p < patterns.length; p++) {
        patterns[p].lastIndex = 0;
        while ((m = patterns[p].exec(masked)) !== null) {
            var brace = masked.indexOf('{', m.index + m[0].length);
            if (brace === -1) continue;
            if (byBrace[brace]) continue;        // same function matched twice
            var end = matchBrace(masked, brace);
            if (end === -1) continue;
            byBrace[brace] = true;
            found.push({ name: m[1], start: m.index, end: end + 1 });
        }
    }

    found.sort(function (a, b) {
        var an = a.name.toLowerCase(), bn = b.name.toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return a.start - b.start;
    });
    return found;
}

// Index of the brace matching the one at `open`, or -1 if unbalanced.
function matchBrace(masked, open) {
    var depth = 0;
    for (var i = open; i < masked.length; i++) {
        var c = masked.charAt(i);
        if (c === '{') depth++;
        else if (c === '}') {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// Same idea as maskLiterals, for NLP++: # to end of line, /* */, and "strings".
function maskNLP(source) {
    var out = [];
    var i = 0;
    var len = source.length;

    function blank(c) { return (c === '\n' || c === '\r') ? c : ' '; }

    while (i < len) {
        var c = source.charAt(i);
        var next = source.charAt(i + 1);

        if (c === '#') {
            while (i < len && source.charAt(i) !== '\n') { out.push(blank(source.charAt(i))); i++; }
            continue;
        }
        if (c === '/' && next === '*') {
            out.push(' ', ' ');
            i += 2;
            while (i < len && !(source.charAt(i) === '*' && source.charAt(i + 1) === '/')) {
                out.push(blank(source.charAt(i)));
                i++;
            }
            if (i < len) { out.push(' ', ' '); i += 2; }
            continue;
        }
        if (c === '"') {
            out.push(' ');
            i++;
            while (i < len) {
                if (source.charAt(i) === '\\') {
                    out.push(' ');
                    if (i + 1 < len) out.push(blank(source.charAt(i + 1)));
                    i += 2;
                    continue;
                }
                if (source.charAt(i) === '"') { out.push(' '); i++; break; }
                out.push(blank(source.charAt(i)));
                i++;
            }
            continue;
        }
        out.push(c);
        i++;
    }
    return out.join('');
}

// Two things in an NLP++ pass are worth pulling out on their own: the
// functions declared in a DECL block, and the pass regions themselves
// (CODE, PRE, RULES ...), which is how these files are actually read.
function scanNLP(source) {
    var masked = maskNLP(source);
    var found = [];
    var starts = lineStarts(masked);
    var i, j;

    // --- pass regions
    var marks = [];
    for (i = 0; i < starts.length; i++) {
        var from = starts[i];
        var to = (i + 1 < starts.length) ? starts[i + 1] : masked.length;
        var m = /^[ \t]*@(@?)([A-Z]+)/.exec(masked.substring(from, to));
        if (!m) continue;
        if (NLP_REGIONS.indexOf(',' + m[2] + ',') === -1) continue;
        marks.push({ name: m[2], isEnd: (m[1] === '@'), start: from, end: to });
    }

    for (i = 0; i < marks.length; i++) {
        if (marks[i].isEnd) continue;
        var stop = masked.length;
        for (j = i + 1; j < marks.length; j++) {
            // its own end marker closes it and belongs to it; anything else stops it
            stop = (marks[j].isEnd && marks[j].name === marks[i].name) ? marks[j].end : marks[j].start;
            break;
        }
        found.push({ name: '@' + marks[i].name, start: marks[i].start, end: stop });
    }

    // --- DECL functions: Name(args) { ... } starting in column 1
    var re = /(^|\n)([A-Za-z_][A-Za-z0-9_]*)[ \t]*\(/g;
    var d;
    while ((d = re.exec(masked)) !== null) {
        var name = d[2];
        if (NLP_KEYWORDS.indexOf(',' + name + ',') !== -1) continue;
        if (NLP_FUNCS.indexOf(',' + name + ',') !== -1) continue;

        var openParen = d.index + d[0].length - 1;
        var closeParen = matchPair(masked, openParen, '(', ')');
        if (closeParen === -1) continue;

        var brace = closeParen + 1;
        while (brace < masked.length && /\s/.test(masked.charAt(brace))) brace++;
        if (masked.charAt(brace) !== '{') continue;

        var close = matchPair(masked, brace, '{', '}');
        if (close === -1) continue;

        found.push({ name: name, start: d.index + d[1].length, end: close + 1 });
    }

    found.sort(function (a, b) {
        var an = a.name.toLowerCase(), bn = b.name.toLowerCase();
        if (an < bn) return -1;
        if (an > bn) return 1;
        return a.start - b.start;
    });
    return found;
}

// Offsets of the first character of every line, for index-preserving scanning.
function lineStarts(text) {
    var starts = [0];
    for (var i = 0; i < text.length; i++) {
        if (text.charAt(i) === '\n') starts.push(i + 1);
    }
    return starts;
}

// Index of the closer matching the opener at `open`, or -1 if unbalanced.
function matchPair(masked, open, openChar, closeChar) {
    var depth = 0;
    for (var i = open; i < masked.length; i++) {
        var c = masked.charAt(i);
        if (c === openChar) depth++;
        else if (c === closeChar) {
            depth--;
            if (depth === 0) return i;
        }
    }
    return -1;
}

// Names for the dropdown, alphabetical. Same name twice (a nested helper
// reusing a name) gets a "name (2)" style suffix so both stay reachable.
function listFunctionNames(source, lang) {
    var found = scanFunctions(source, lang);
    var names = [], counts = {};
    for (var i = 0; i < found.length; i++) {
        var n = found[i].name;
        counts[n] = (counts[n] || 0) + 1;
        names.push(counts[n] > 1 ? n + ' (' + counts[n] + ')' : n);
    }
    return names;
}

// Pull one function's full source out of a file, by the label the dropdown shows.
function extractFunction(source, label, lang) {
    var name = label, nth = 1;
    var m = /^(.*) \((\d+)\)$/.exec(label);
    if (m) { name = m[1]; nth = parseInt(m[2], 10); }

    var found = scanFunctions(source, lang);
    var seen = 0;
    for (var i = 0; i < found.length; i++) {
        if (found[i].name !== name) continue;
        seen++;
        if (seen === nth) return source.substring(found[i].start, found[i].end);
    }
    return null;
}

// ---------------------------------------------------------------- languages
// Which grammar to color a file with, from its extension. These are the
// languages the NLP++ VS Code extension defines, plus JavaScript/ExtendScript.
function detectLanguage(file) {
    var name = (file && file.name) ? file.name.toLowerCase() : '';
    var dot = name.lastIndexOf('.');
    var ext = (dot === -1) ? '' : name.substring(dot + 1);

    switch (ext) {
        case 'jsx': case 'js':  return 'js';
        case 'nlp': case 'pat': return 'nlp';
        case 'tree':            return 'tree';
        case 'kbb':             return 'kbb';
        case 'kb':              return 'kb';
        case 'dict':            return 'dict';
        case 'seq':             return 'seq';
        case 'txxt':            return 'txxt';
        default:                return 'text';
    }
}

function languageLabel(lang) {
    switch (lang) {
        case 'js':   return 'JavaScript / ExtendScript';
        case 'nlp':  return 'NLP++ pass';
        case 'tree': return 'NLP++ parse tree';
        case 'kbb':  return 'NLP++ knowledge base (kbb)';
        case 'kb':   return 'NLP++ knowledge base (kb)';
        case 'dict': return 'NLP++ dictionary';
        case 'seq':  return 'NLP++ analyzer sequence';
        case 'txxt': return 'NLP++ text';
        default:     return 'plain text';
    }
}

// The color unmarked text takes; .txxt dims everything that is not markup.
function baseColor(lang) {
    return (lang === 'txxt') ? TXXT_THEME.text : THEME.text;
}

// ---------------------------------------------------------------- tokenizer
// Split one line into {text, color} spans for the given language. `state`
// carries whatever has to survive across lines, such as an open block comment.
function tokenizeLine(line, state, lang) {
    switch (lang) {
        case 'nlp':  return tokenizeNLP(line, state);
        case 'tree': return tokenizeTree(line, state);
        case 'kbb':  return tokenizeKBB(line, state);
        case 'kb':   return tokenizeKB(line, state);
        case 'dict': return tokenizeDict(line, state);
        case 'seq':  return tokenizeSeq(line, state);
        case 'txxt': return tokenizeTxxt(line, state);
        case 'text': return [{ text: line, color: THEME.text }];
        default:     return tokenizeJS(line, state);
    }
}

// Collects spans, merging runs of default-colored text as it goes.
function Spans(defaultColor) {
    this.list = [];
    this.pending = '';
    this.defaultColor = defaultColor;
}
Spans.prototype.plain = function (text) {
    this.pending += text;
};
Spans.prototype.push = function (text, color) {
    this.flush();
    this.list.push({ text: text, color: color });
};
Spans.prototype.flush = function () {
    if (this.pending.length) {
        this.list.push({ text: this.pending, color: this.defaultColor });
        this.pending = '';
    }
};
Spans.prototype.done = function () {
    this.flush();
    return this.list;
};

// ---- NLP++ pass files (.nlp, .pat) -------------------------------------
function tokenizeNLP(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;
    var isRewriteLine = /<-/.test(line);
    var seenWord = false;

    if (state.inComment) {
        var close = line.indexOf('*/');
        if (close === -1) return [{ text: line, color: NLP_THEME.comment }];
        s.push(line.substring(0, close + 2), NLP_THEME.comment);
        state.inComment = false;
        i = close + 2;
    }

    while (i < len) {
        var c = line.charAt(i);
        var next = line.charAt(i + 1);

        // # comment to end of line
        if (c === '#') {
            s.push(line.substring(i), NLP_THEME.comment);
            break;
        }

        // /* block comment */
        if (c === '/' && next === '*') {
            var end = line.indexOf('*/', i + 2);
            if (end === -1) {
                s.push(line.substring(i), NLP_THEME.comment);
                state.inComment = true;
                break;
            }
            s.push(line.substring(i, end + 2), NLP_THEME.comment);
            i = end + 2;
            continue;
        }

        // "string"
        if (c === '"') {
            var j = i + 1;
            while (j < len) {
                if (line.charAt(j) === '\\') { j += 2; continue; }
                if (line.charAt(j) === '"') { j++; break; }
                j++;
            }
            s.push(line.substring(i, j), NLP_THEME.string);
            i = j;
            continue;
        }

        // region markers and their terminators
        if (c === '@') {
            var a = i + 1;
            if (line.charAt(a) === '@') a++;
            while (a < len && isWordChar(line.charAt(a))) a++;
            s.push(line.substring(i, a), NLP_THEME.region);
            i = a;
            continue;
        }

        // <- rewrite arrow
        if (c === '<' && next === '-') {
            s.push('<-', NLP_THEME.region);
            i += 2;
            continue;
        }

        // _variable, _xWILD, or the _node being built on a rewrite line
        if (c === '_' || (isWordStart(c) && c !== '_')) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            var word = line.substring(i, w);
            var color;

            if (word.charAt(0) === '_') {
                if (NLP_CONSTANTS.indexOf(',' + word + ',') !== -1)      color = NLP_THEME.constant;
                else if (isRewriteLine && !seenWord)                     color = NLP_THEME.rewrite;
                else                                                     color = NLP_THEME.parameter;
            } else if (word.length === 1 && ',G,N,S,X,L,'.indexOf(',' + word + ',') !== -1) {
                color = NLP_THEME.letterFunc;
            } else if (NLP_KEYWORDS.indexOf(',' + word + ',') !== -1) {
                color = NLP_THEME.keyword;
            } else if (NLP_WORDOPS.indexOf(',' + word + ',') !== -1) {
                color = NLP_THEME.wordOp;
            } else if (NLP_FUNCS.indexOf(',' + word + ',') !== -1) {
                color = NLP_THEME.funcName;
            } else if (NLP_ATTRS.indexOf(',' + word + ',') !== -1) {
                color = NLP_THEME.attribute;
            } else if (nextNonSpace(line, w) === '(') {
                color = NLP_THEME.funcName;
            } else {
                color = THEME.text;
            }

            s.push(word, color);
            seenWord = true;
            i = w;
            continue;
        }

        // number
        if (isDigit(c)) {
            var k = i;
            while (k < len && (isDigit(line.charAt(k)) || line.charAt(k) === '.')) k++;
            s.push(line.substring(i, k), NLP_THEME.number);
            i = k;
            continue;
        }

        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- parse tree dumps (.tree) ------------------------------------------
function tokenizeTree(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;

    if (/^\s*#/.test(line)) return [{ text: line, color: TREE_THEME.comment }];

    // leading indent, then the node name
    while (i < len && (line.charAt(i) === ' ' || line.charAt(i) === '\t')) i++;
    if (i > 0) s.plain(line.substring(0, i));
    if (i < len && line.charAt(i) !== '_' && isWordChar(line.charAt(i))) {
        var n = i;
        while (n < len && isWordChar(line.charAt(n))) n++;
        s.push(line.substring(i, n), TREE_THEME.node);
        i = n;
    }

    while (i < len) {
        var c = line.charAt(i);

        if (c === '"') {
            var j = i + 1;
            while (j < len) {
                if (line.charAt(j) === '\\') { j += 2; continue; }
                if (line.charAt(j) === '"') { j++; break; }
                j++;
            }
            s.push(line.substring(i, j), TREE_THEME.string);
            i = j;
            continue;
        }
        if (isWordStart(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            var word = line.substring(i, w);
            if (word.charAt(0) === '_')                              s.push(word, TREE_THEME.rewrite);
            else if (word.toLowerCase() === 'fired')                 s.push(word, TREE_THEME.fired);
            else if (TREE_ATTRS.indexOf(',' + word.toLowerCase() + ',') !== -1) s.push(word, TREE_THEME.attribute);
            else                                                     s.plain(word);
            i = w;
            continue;
        }
        if (isDigit(c)) {
            var k = i;
            while (k < len && isDigit(line.charAt(k))) k++;
            s.push(line.substring(i, k), TREE_THEME.number);
            i = k;
            continue;
        }
        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- knowledge base dumps (.kbb) ---------------------------------------
// Concepts are nested by indentation: column 0, 2, 4, then 6 and deeper.
function tokenizeKBB(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;

    if (/^\s*#/.test(line)) return [{ text: line, color: KBB_THEME.comment }];

    while (i < len && line.charAt(i) === ' ') i++;
    var indent = i;
    if (indent > 0) s.plain(line.substring(0, indent));

    // Concept names are plain text and can be any script at all - country and
    // nationality lists carry names like "aland islands" spelled with a ring -
    // so anything that is not punctuation starts a heading here.
    var first = line.charAt(i);
    if (i < len && first !== '[' && first !== '=' && first !== ':') {
        var label = i;
        while (label < len && line.charAt(label) !== ':' &&
               line.charAt(label) !== '[' && line.charAt(label) !== '=') label++;
        // a name= pair is an attribute, not a concept heading
        if (line.charAt(label) !== '=') {
            var color = (indent === 0) ? KBB_THEME.top
                      : (indent < 4)   ? KBB_THEME.concept
                      : (indent < 6)   ? KBB_THEME.concept1
                                       : KBB_THEME.concept2;
            s.push(line.substring(i, label), color);
            i = label;
        }
    }

    while (i < len) {
        var c = line.charAt(i);

        if (c === '"') {
            var j = i + 1;
            while (j < len) {
                if (line.charAt(j) === '\\') { j += 2; continue; }
                if (line.charAt(j) === '"') { j++; break; }
                j++;
            }
            s.push(line.substring(i, j), KBB_THEME.string);
            i = j;
            continue;
        }
        if (isWordChar(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            if (line.charAt(w) === '=') s.push(line.substring(i, w), KBB_THEME.attribute);
            else if (isDigit(c))        s.push(line.substring(i, w), KBB_THEME.number);
            else                        s.plain(line.substring(i, w));
            i = w;
            continue;
        }
        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- knowledge base source (.kb) ---------------------------------------
function tokenizeKB(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;

    if (/^\s*[*#]/.test(line)) return [{ text: line, color: MISC_THEME.comment }];

    while (i < len) {
        var c = line.charAt(i);

        if (c === '"') {
            var j = i + 1;
            while (j < len) {
                if (line.charAt(j) === '\\') { j += 2; continue; }
                if (line.charAt(j) === '"') { j++; break; }
                j++;
            }
            s.push(line.substring(i, j), MISC_THEME.string);
            i = j;
            continue;
        }
        if (isWordStart(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            var word = line.substring(i, w).toLowerCase();
            if (KB_ACTIONS.indexOf(',' + word + ',') !== -1)       s.push(line.substring(i, w), MISC_THEME.parameter);
            else if (KB_KEYWORDS.indexOf(',' + word + ',') !== -1) s.push(line.substring(i, w), MISC_THEME.keyword);
            else                                                   s.plain(line.substring(i, w));
            i = w;
            continue;
        }
        if (isDigit(c)) {
            var k = i;
            while (k < len && isDigit(line.charAt(k))) k++;
            s.push(line.substring(i, k), MISC_THEME.number);
            i = k;
            continue;
        }
        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- dictionary files (.dict) ------------------------------------------
// Each line is a headword followed by name=value attribute pairs.
function tokenizeDict(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;

    if (/^\s*#/.test(line)) return [{ text: line, color: MISC_THEME.comment }];

    while (i < len && line.charAt(i) === ' ') i++;
    if (i > 0) s.plain(line.substring(0, i));

    if (i < len && line.charAt(i) !== ' ') {          // the headword, any script
        var h = i;
        while (h < len && line.charAt(h) !== ' ' && line.charAt(h) !== '\t') h++;
        s.push(line.substring(i, h), MISC_THEME.word);
        i = h;
    }

    while (i < len) {
        var c = line.charAt(i);

        if (isWordChar(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            if (line.charAt(w) === '=') s.push(line.substring(i, w), MISC_THEME.attribute);
            else                        s.plain(line.substring(i, w));
            i = w;
            continue;
        }
        if (c === '=') { s.push('=', MISC_THEME.operator); i++; continue; }
        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- analyzer sequence (.seq) ------------------------------------------
function tokenizeSeq(line, state) {
    var s = new Spans(THEME.text);
    var len = line.length;
    var i = 0;

    while (i < len) {
        var c = line.charAt(i);

        // sequence files carry a trailing "# what this pass does" on most lines
        if (c === '#') {
            s.push(line.substring(i), MISC_THEME.comment);
            break;
        }
        if (isWordStart(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            var word = line.substring(i, w);
            if (SEQ_KEYWORDS.indexOf(',' + word.toLowerCase() + ',') !== -1) s.push(word, MISC_THEME.keyword);
            else                                                            s.plain(word);
            i = w;
            continue;
        }
        if (isDigit(c)) {
            var k = i;
            while (k < len && isDigit(line.charAt(k))) k++;
            s.push(line.substring(i, k), MISC_THEME.number);
            i = k;
            continue;
        }
        s.plain(c);
        i++;
    }
    return s.done();
}

// ---- text files (.txxt) ------------------------------------------------
// Markup is <<< >>> and ((( ))) comments, both of which can span lines.
function tokenizeTxxt(line, state) {
    var s = new Spans(TXXT_THEME.text);
    var len = line.length;
    var i = 0;

    while (i < len) {
        if (state.inTxxtComment) {
            var cEnd = line.indexOf(')))', i);
            if (cEnd === -1) { s.push(line.substring(i), TXXT_THEME.comment); break; }
            s.push(line.substring(i, cEnd + 3), TXXT_THEME.comment);
            state.inTxxtComment = false;
            i = cEnd + 3;
            continue;
        }
        if (state.inTxxtTag) {
            var tEnd = line.indexOf('>>>', i);
            if (tEnd === -1) { s.push(line.substring(i), TXXT_THEME.keyword); break; }
            s.push(line.substring(i, tEnd + 3), TXXT_THEME.keyword);
            state.inTxxtTag = false;
            i = tEnd + 3;
            continue;
        }
        if (line.substring(i, i + 3) === '(((') { state.inTxxtComment = true; continue; }
        if (line.substring(i, i + 3) === '<<<') { state.inTxxtTag = true; continue; }

        s.plain(line.charAt(i));
        i++;
    }
    return s.done();
}

// ---- JavaScript / ExtendScript (.jsx, .js) -----------------------------
function tokenizeJS(line, state) {
    var spans = [];
    var i = 0;
    var len = line.length;
    var pending = '';
    var lastWord = '';

    function flush() {
        if (pending.length) {
            spans.push({ text: pending, color: THEME.operator });
            pending = '';
        }
    }
    function push(text, color) {
        flush();
        spans.push({ text: text, color: color });
    }

    if (state.inComment) {
        var end = line.indexOf('*/');
        if (end === -1) {
            spans.push({ text: line, color: THEME.comment });
            return spans;
        }
        spans.push({ text: line.substring(0, end + 2), color: THEME.comment });
        state.inComment = false;
        i = end + 2;
    }

    while (i < len) {
        var c = line.charAt(i);
        var next = line.charAt(i + 1);

        // line comment
        if (c === '/' && next === '/') {
            push(line.substring(i), THEME.comment);
            break;
        }

        // block comment
        if (c === '/' && next === '*') {
            var close = line.indexOf('*/', i + 2);
            if (close === -1) {
                push(line.substring(i), THEME.comment);
                state.inComment = true;
                break;
            }
            push(line.substring(i, close + 2), THEME.comment);
            i = close + 2;
            continue;
        }

        // string
        if (c === '"' || c === "'") {
            var j = i + 1;
            while (j < len) {
                if (line.charAt(j) === '\\') { j += 2; continue; }
                if (line.charAt(j) === c) { j++; break; }
                j++;
            }
            push(line.substring(i, j), THEME.string);
            i = j;
            lastWord = '';
            continue;
        }

        // ExtendScript directive: #target, #include
        if (c === '#' && isWordStart(next)) {
            var d = i + 1;
            while (d < len && isWordChar(line.charAt(d))) d++;
            push(line.substring(i, d), THEME.keyword);
            i = d;
            lastWord = '';
            continue;
        }

        // number
        if (isDigit(c) || (c === '.' && isDigit(next))) {
            var k = i;
            while (k < len && (isDigit(line.charAt(k)) || line.charAt(k) === '.' ||
                   line.charAt(k) === 'x' || line.charAt(k) === 'X' || isHex(line.charAt(k)))) k++;
            push(line.substring(i, k), THEME.number);
            i = k;
            lastWord = '';
            continue;
        }

        // identifier / keyword
        if (isWordStart(c)) {
            var w = i;
            while (w < len && isWordChar(line.charAt(w))) w++;
            var word = line.substring(i, w);
            var after = nextNonSpace(line, w);
            var color;

            if (KW_CONTROL.indexOf(',' + word + ',') !== -1)         color = THEME.control;
            else if (KW_OTHER.indexOf(',' + word + ',') !== -1)      color = THEME.keyword;
            else if (KW_TYPE.indexOf(',' + word + ',') !== -1)       color = THEME.type;
            else if (lastWord === 'new')                             color = THEME.type;
            else if (lastWord === 'function' || after === '(')       color = THEME.funcName;
            else                                                     color = THEME.variable;

            push(word, color);
            i = w;
            lastWord = word;
            continue;
        }

        // whitespace and punctuation ride along in the default color
        pending += c;
        if (c !== ' ' && c !== '\t') lastWord = '';
        i++;
    }
    flush();
    return spans;
}

function isDigit(c)     { return c >= '0' && c <= '9'; }
function isHex(c)       { return (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F'); }
function isWordStart(c) { return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === '_' || c === '$'; }
function isWordChar(c)  { return isWordStart(c) || isDigit(c); }

function nextNonSpace(line, from) {
    for (var i = from; i < line.length; i++) {
        var c = line.charAt(i);
        if (c !== ' ' && c !== '\t') return c;
    }
    return '';
}

// ---------------------------------------------------------------- drawing
function drawCodeBlock(doc, code, settings, title) {
    var lines = splitLines(expandTabs(code, settings.tabWidth));
    var gutter = String(lines.length).length;

    // Build the display string and the color spans in one pass.
    var contents = '';
    var spans = [];
    var state = { inComment: false, inTxxtComment: false, inTxxtTag: false };
    var offset = 0;
    var base = baseColor(settings.lang);

    for (var i = 0; i < lines.length; i++) {
        if (settings.lineNumbers) {
            var num = padLeft(String(i + 1), gutter) + '  ';
            contents += num;
            spans.push({ start: offset, end: offset + num.length, color: THEME.lineNumber });
            offset += num.length;
        }
        var lineSpans = tokenizeLine(lines[i], state, settings.lang);
        for (var s = 0; s < lineSpans.length; s++) {
            var t = lineSpans[s].text;
            contents += t;
            spans.push({ start: offset, end: offset + t.length, color: lineSpans[s].color });
            offset += t.length;
        }
        if (i < lines.length - 1) {
            contents += '\r';
            offset += 1;
        }
    }

    // Place near the top-left of the active artboard.
    var rect = doc.artboards[doc.artboards.getActiveArtboardIndex()].artboardRect;
    var left = rect[0] + 36;
    var top  = rect[1] - 36;

    // Everything is created on an explicit layer, and then inside the group.
    // Going through doc.groupItems / doc.textFrames instead targets whatever
    // the active layer happens to be, which is what raises error 8705.
    var layer = getTargetLayer(doc);

    var group = createGroup(doc, layer, 'Code: ' + title);
    if (!group) return;                          // createGroup already explained why

    var tf;
    try {
        tf = group.textFrames.add();
    } catch (e) {
        tf = layer.textFrames.add();
        tf.moveToBeginning(group);
    }
    tf.contents = contents;

    var attrs = tf.textRange.characterAttributes;
    try { attrs.textFont = settings.font; } catch (e) {}
    attrs.size = settings.size;
    attrs.autoLeading = false;
    attrs.leading = settings.size * settings.leading;
    attrs.fillColor = hexColor(base);

    tf.top = top - settings.padding;
    tf.left = left + settings.padding;

    // Color each span; the runs already in the base color need no work.
    var cache = {};
    for (var p = 0; p < spans.length; p++) {
        if (spans[p].color === base) continue;
        colorSpan(tf, spans[p].start, spans[p].end, hexColor(spans[p].color, cache));
    }

    if (settings.background) {
        var b = tf.geometricBounds;              // [left, top, right, bottom]
        var pad = settings.padding;
        var t = b[1] + pad;
        var l = b[0] - pad;
        var w = (b[2] - b[0]) + pad * 2;
        var h = (b[1] - b[3]) + pad * 2;

        var bg;
        try {
            bg = group.pathItems.rectangle(t, l, w, h);
        } catch (e) {
            bg = layer.pathItems.rectangle(t, l, w, h);
            bg.move(group, ElementPlacement.PLACEATEND);
        }
        bg.filled = true;
        bg.fillColor = hexColor(THEME.background, cache);
        bg.stroked = false;
        bg.name = 'Code background';
        bg.zOrder(ZOrderMethod.SENDTOBACK);       // behind the text, inside the group
    }

    try {
        doc.selection = null;
        group.selected = true;
    } catch (e) {}
}

// Create the code group on a specific layer. If that layer still refuses art,
// offer to unlock it, and failing that explain what the document state is.
function createGroup(doc, layer, name) {
    var group = null;

    try {
        group = layer.groupItems.add();
    } catch (e) {
        if (unlockLayer(layer)) {
            try { group = layer.groupItems.add(); } catch (e2) { group = null; }
        }
    }

    if (!group) {
        reportLayerProblem(doc);
        return null;
    }
    group.name = name;
    return group;
}

// Only ever unlocks with the user's say-so, and unlocks the whole parent chain
// since a locked parent layer keeps its sublayers locked too.
function unlockLayer(layer) {
    if (!confirm('The layer "' + layer.name + '" will not accept new art.\n\n' +
                 'Unlock it and make it visible so the code block can be placed there?')) {
        return false;
    }
    try {
        var l = layer;
        while (l && l.typename === 'Layer') {
            l.locked = false;
            l.visible = true;
            l = l.parent;
        }
        return true;
    } catch (e) {
        return false;
    }
}

function reportLayerProblem(doc) {
    var msg = ['Illustrator would not let the script add art to this document.',
               '',
               'If you are in isolation mode (double-clicked into a group or a',
               'symbol), press Escape to get back out, then run the script again.',
               '',
               'Layers:'];
    try {
        for (var i = 0; i < doc.layers.length; i++) {
            var l = doc.layers[i];
            msg.push('    ' + l.name +
                     '  -  ' + (l.locked ? 'locked' : 'unlocked') +
                     ', ' + (l.visible ? 'visible' : 'hidden') +
                     (l.name === doc.activeLayer.name ? '   (active)' : ''));
        }
    } catch (e) {
        msg.push('    (could not read the layer list)');
    }
    alert(msg.join('\n'));
}

// Make the active layer one that art can be added to: keep the current layer
// if it is unlocked and visible, otherwise switch to the first layer that is,
// and if every layer is locked or hidden, add a fresh "Code" layer. The user's
// own layers are never unlocked or shown behind their back.
function getTargetLayer(doc) {
    var chosen = null;

    if (usableLayer(doc.activeLayer)) {
        chosen = doc.activeLayer;
    } else {
        for (var i = 0; i < doc.layers.length && !chosen; i++) {
            if (usableLayer(doc.layers[i])) chosen = doc.layers[i];
        }
    }

    if (!chosen) {                               // every layer is locked or hidden
        try {
            chosen = doc.layers.add();
            chosen.name = 'Code';
        } catch (e) {
            chosen = doc.activeLayer;            // let createGroup report the failure
        }
    }

    // Matching the active layer to the target keeps the Layers panel honest,
    // but the art is created on `chosen` either way.
    try { doc.activeLayer = chosen; } catch (e) {}
    return chosen;
}

// A layer is usable only if it and every layer above it in the nesting are
// unlocked and visible; a locked parent locks its sublayers too.
function usableLayer(layer) {
    try {
        var l = layer;
        while (l && l.typename === 'Layer') {
            if (l.locked || !l.visible) return false;
            l = l.parent;
        }
        return true;
    } catch (e) {
        return false;
    }
}

function colorSpan(tf, start, end, color) {
    try {
        var r = tf.textRange;
        r.start = start;
        r.end = end;
        r.characterAttributes.fillColor = color;
    } catch (e) {
        // Older builds will not let a TextRange move; fall back per character.
        for (var i = start; i < end; i++) {
            try { tf.characters[i].characterAttributes.fillColor = color; } catch (e2) {}
        }
    }
}

function hexColor(hex, cache) {
    if (cache && cache[hex]) return cache[hex];
    var c = new RGBColor();
    c.red   = parseInt(hex.substring(0, 2), 16);
    c.green = parseInt(hex.substring(2, 4), 16);
    c.blue  = parseInt(hex.substring(4, 6), 16);
    if (cache) cache[hex] = c;
    return c;
}

function expandTabs(text, width) {
    var spaces = '';
    for (var i = 0; i < width; i++) spaces += ' ';
    return text.replace(/\t/g, spaces);
}

function splitLines(text) {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
}

// Drop leading and trailing blank lines so a whole-file block starts on code.
function trimBlankEdges(text) {
    var lines = splitLines(text);
    while (lines.length && isBlank(lines[0])) lines.shift();
    while (lines.length && isBlank(lines[lines.length - 1])) lines.pop();
    return lines.join('\n');
}

function isBlank(line) {
    return /^\s*$/.test(line);
}

function padLeft(str, width) {
    while (str.length < width) str = ' ' + str;
    return str;
}

main();
