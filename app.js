const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const app = electron.app
const ipcMain = electron.ipcMain;
const dialog = electron.dialog;
const fs = require('fs');

const electronWindow = require('electron-window');
let readFile = null;
let mainWindow = null;

process.argv.forEach(function (val, index, array) {
   if (index == 2) {
       readFile = val;
   } else {
       readfile = null;
   }
 });

function loadFile(filenames) {
	mainWindow.send('remote-log', 'start loadFile');
	if (filenames === undefined) return;
	// store the filename somewhere so it can be saved!
	readFile = filenames[0];
	mainWindow.send('remote-log', 'filename: ' + filenames);
	fs.readFile(filenames[0], 'utf-8', function (err, data) {
		mainWindow.send('load-data', data);
	});
	mainWindow.send('remote-log', 'end loadFile');
}	

function openFile() {
	dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'DOT', extensions: ['dot','gv'] }]}, loadFile);
};

function saveFile() {
	mainWindow.send('remote-log', 'start saveFile');
	
	if (readFile) {
		mainWindow.send('save-data', readFile);
	} else {
		// call save as
	}
	
	mainWindow.send('remote-log', 'end saveFile');
}

ipcMain.on('save-data', (event, arg) => {
	console.log('save-data (main): ' + arg.filename);
	mainWindow.send('remote-log', 'start save-data');
});

function saveFileAs() {
	// do nothing!
}

let template = [
   {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
            openFile();
		  }
        },
        accelerator: 'CmdOrCtrl+O',
        role: 'open'
      },
      {
        label: 'Save',
        click: function(item, focusedWindow) {
          if (focusedWindow) {
		    saveFile();
		  }
        },
        accelerator: 'CmdOrCtrl+S',
        role: 'Save'
      },
      {
        label: 'Save as',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            saveFileAs();
        },
        //accelerator: 'CmdOrCtrl+S',
        role: 'save-as'
      }
    ]
  }, 
    
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo'
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut'
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy'
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste'
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.reload();
        }
      },
      {
        label: 'Toggle Full Screen',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Ctrl+Command+F';
          else
            return 'F11';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.setFullScreen(!focusedWindow.isFullScreen());
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: (function() {
          if (process.platform == 'darwin')
            return 'Alt+Command+I';
          else
            return 'Ctrl+Shift+I';
        })(),
        click: function(item, focusedWindow) {
          if (focusedWindow)
            focusedWindow.toggleDevTools();
        }
      }
    ]
  },
  {
    label: 'Window',
    role: 'window',
    submenu: [
      {
        label: 'Minimize',
        accelerator: 'CmdOrCtrl+M',
        role: 'minimize'
      },
      {
        label: 'Close',
        accelerator: 'CmdOrCtrl+W',
        role: 'close'
      }
    ]
  },
  {
    label: 'Help',
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: function() { electron.shell.openExternal('http://electron.atom.io') }
      }
    ]
  }
];

if (process.platform == 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: 'About ' + name,
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        label: 'Services',
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        label: 'Hide ' + name,
        accelerator: 'Command+H',
        role: 'hide'
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Shift+H',
        role: 'hideothers'
      },
      {
        label: 'Show All',
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: function() { app.quit(); }
      }
    ]
  });
  // Window menu.
  template[3].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  );
}
 
app.on('ready', function() {
    const options = {
            width: 800,
            height: 600,
            icon: 'assets/icon.png',
            javascript : false
        };
    
    mainWindow = electronWindow.createWindow(options);   
    const args = {
        file: readFile
    };
	
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
  
    mainWindow.showUrl(__dirname + '/index.html', args);
});
