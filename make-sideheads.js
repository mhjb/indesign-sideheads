
var doc = app.activeDocument

// Thanks https://community.adobe.com/t5/photoshop/console-log-shim/td-p/9923125?page=1 !
// in terminal run: nc -lvk 8000
this.socket = new Socket();
this.hostPort = "127.0.0.1:8000"
function console_log(message) {
  if (this.socket.open(this.hostPort)){
    this.socket.write (message + "\n")
    this.socket.close()
  }
}
console_log('---')

if(!app.selection[0]) {
  alert("Please put the insertion point into a paragraph of the style you'd like converted to anchored frames")
  exit()
}

var object_styles = []
for(var i = 0; i < app.activeDocument.objectStyles.length; i++) {
  object_styles.push(app.activeDocument.objectStyles[i].name)
}

myDialog = app.dialogs.add({ name: 'Sideheads'} )
with(myDialog.dialogColumns.add()) {
  staticTexts.add({ staticLabel: 'Choose a destination object style' });
  var myDropdown = dropdowns.add({ stringList: object_styles })
}
if(myDialog.show()) {
  var chosen_object_style = myDropdown.selectedIndex
}
else exit()


function main() {
  var source_style = app.selection[0].appliedParagraphStyle.name
  var paragraphs = app.selection[0].parentStory.paragraphs
  for(var i = 0; i < paragraphs.length; i++) {
    var para = paragraphs[i]
    var style = para.isValid ? para.appliedParagraphStyle.name : null
    if(style === source_style) {
      var contents = para.contents
      var frame = para.insertionPoints.item(-1).textFrames.add()
      frame.appliedObjectStyle = doc.objectStyles[chosen_object_style]      // thanks https://community.adobe.com/t5/indesign/set-all-text-frame-object-style-to-none/m-p/9913234#M103431
      frame.texts[0].contents = contents.slice(0, -1)                       // remove trailing \n; thanks https://flaviocopes.com/how-to-remove-last-char-string-js/
      frame.texts[0].appliedParagraphStyle = para.appliedParagraphStyle
      frame.texts[0].recompose()
      frame.fit(FitOptions.frameToContent)                                  // thanks https://stackoverflow.com/questions/26908750/fit-frame-to-content-after-changing-its-contents
    }
  }
}

// main()
app.doScript(main, ScriptLanguage.JAVASCRIPT, [], UndoModes.ENTIRE_SCRIPT, 'Convert style to anchored frames') // thanks https://indesignsecrets.com/add-undo-to-your-script.php
