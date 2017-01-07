function isDefined(attr) {
	if (typeof attr !== typeof undefined && attr !== false && attr !== null) {
		return true;
	}
	return false;
}

const electron = require('electron');
const shell = electron.shell;
const ipcRenderer = electron.ipcRenderer;

// Prevent default click 'a' event
document.addEventListener('click', function(event) {
	let url = event.target.getAttribute('href');
	if (isDefined(url)) {
		shell.openExternal(url);
		event.preventDefault();
	}
}, false);
	
ipcRenderer.on('load-data', (event, arg) => {
	console.log('load-data');
	let editor = ace.edit("editor");
	// var code = editor.getValue();

	editor.setValue(arg);
 });
 
 ipcRenderer.on('remote-log', (event, arg) => {
	console.log(arg);
 });
	
ipcRenderer.on('save-data', (event, arg) => {
	console.log('save-data (renderer): ' + arg);
	
	
	let editor = ace.edit("editor");
	var code = editor.getValue();
	let saveArg = {'filename':arg, 'code': code};
	event.sender.send('save-data', saveArg);
	// ipcRenderer.send('save-data','pong');

	//editor.setValue(arg);
 });
