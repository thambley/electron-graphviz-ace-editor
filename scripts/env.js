// https://github.com/diversen/electron-markdown-editor

let app = {
  env: '',
  agent: ''
};

if (window && window.process && window.process.type) {
  app.env = 'electron';
} else {
  app.env = 'browser';
}
