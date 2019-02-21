const menubar = require('menubar')
const { app, dialog, globalShortcut, systemPreferences, ipcMain } = require('electron');
const Url = require('url');
const Path = require('path');

const htmlUrl = (relativePath) => Path.join('file://', __dirname, relativePath);
const appPath = app.getAppPath();
const mb = menubar({
  index: htmlUrl('index.html'), 
  icon:   `${appPath}/assets/icon-off.png`,
  showOnRightClick: true,
})

let inputVolume = 100;

const exec = require('child_process').exec;

let logs = ''

const isDev = () => Boolean(process.env.npm_lifecycle_script)

const _log = function(){
  console.log('Arguments', arguments, typeof arguments, typeof arguments.forEach)
  const logMsg = [...arguments].map(arg => JSON.stringify(arg, null, 2)).join(' ');
  logs = logMsg + "\n------------\n" + logs;
  logs = logs.substring(0, 1000);
  if( mb.window && mb.window.webContents ){
    mb.window.webContents.send('logUpdated', logs)
  }
  if( isDev() ) {
    console.log.apply(console, [...arguments]);
  }
}

_log('Is Dev: ', isDev());

function execute(command, callback = () => null) {
    exec(command, (error, stdout, stderr) => { 
        _log({stdout});
        callback(stdout); 
    });
};

function getCurrentVolume() {
  return new Promise( (resolve, reject) => {
    _log('getting volume in...')
    execute(`osascript -e 'tell application "System Events" to get volume settings'`, stdout => {
      const volumes = stdout.split(', ').reduce((acc,val) =>{
        const parts = val.split(':');
        const value = parts[1].trim();
        const key = parts[0].trim().replace(' ', '_');
        acc[key] = isNaN(parseInt(value)) ? value: parseInt(value);
        return acc;
      }, {});
      _log({...volumes});
      resolve(volumes)
    });
  })
}

function setInputIcon(nextState) {
  const nextIcon = `${appPath}/assets/icon-${nextState}.png`;
  mb.setOption('icon', nextIcon);
  mb.tray.setImage(nextIcon);
}

function setInputVolume(nextState, inputVolume) {
  _log('setting', {nextState, inputVolume})
  setInputIcon(nextState);
  if( nextState === 'off' ) {
    execute(`osascript -e 'tell application "System Events" to set volume input volume 0'`)
  } else  {
    execute(`osascript -e 'tell application "System Events" to set volume input volume ${inputVolume}'`)
  }
}

function toggleState(force = false) {
  const nextState = force || !mb.getOption('icon').match('icon-on') ? 'on' : 'off';
  getCurrentVolume().then( volumes => {
    if( nextState === 'off' ) {
      inputVolume = volumes.input_volume || 100;
    }
    setInputVolume(nextState, inputVolume);
  });
}


function initialize () {
  makeSingleInstance()

  // TODO: dark mode / normal mode icons
  const isDarkMode = systemPreferences.isDarkMode();
  
  mb.on('ready', function ready () {
    
    getCurrentVolume().then( volumes => {
      inputVolume = volumes.input_volume
      _log('initial input volume', inputVolume);
      if( 10 >= inputVolume ) {
        setInputIcon('off');
        setInputVolume('off');
        inputVolume = 100;
      } else {
        setInputIcon('on');
      }
    });
    globalShortcut.register("Command + Control + F12 ", () => {
      toggleState();
    });
  
    mb.tray.on('click', function show () {
      toggleState();
    })

    ipcMain.on('quitButtonClicked', function(e, a) {
      app.quit();
    })
    
  });

  app.on('ready', () => {
    // createWindow();
  })

}



// Make this app a single instance app.
//
// The main window will be restored and focused instead of a second window
// opened when a person attempts to launch a second instance.
//
// Returns true if the current version of the app should quit instead of
// launching.
function makeSingleInstance () {
  if (process.mas) return

  app.requestSingleInstanceLock()

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

initialize();