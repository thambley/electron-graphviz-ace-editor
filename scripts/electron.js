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
	event.preventDefault();
	let url = event.target.getAttribute('href');
	if (isDefined(url)) {
		shell.openExternal(url);
	}
}, false);
	
ipcRenderer.on('load-data', (event, arg) => {
	console.log('load-data:' + event);
	let editor = ace.edit("editor");
	// var code = editor.getValue();

	editor.setValue(arg);
 });
 
 ipcRenderer.on('remote-log', (event, arg) => {
	console.log(arg);
 });

