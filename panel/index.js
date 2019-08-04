'use strict';

const Fs = require('fs');
const cp = require('child_process');
const { ipcRenderer } = require('electron');

var PATH = {
  html: Editor.url('packages://dragonbones-viewer/panel/list.html'),
  style: Editor.url('packages://dragonbones-viewer/panel/list.css'),
};

var createVM = function (elem) {
  return new Vue({
    el: elem,
    data: {
      items: [],
      path: "",
      flag: false
    },
    watch: {
      resources() {
        this.searchRes();
      },
    },
    methods: {
      goHub() {
        cp.exec('start https://github.com/krapnikkk/Creator-dragonBones-Viewer');
      },

      view(path) {
        this.path = path;
        if (!this.flag) {
          Editor.Panel.open('dragonbones-viewer.viewer');
        } else {
          Editor.Panel.close('dragonbones-viewer.viewer', () => {
            this.view(this.path);
          });

        }
      },
      send() {
        Editor.Ipc.sendToWins('view', this.path, function (error, answer) { });
      },
      searchRes() {
        this.items = [];
        Editor.assetdb.queryAssets('db://assets/**/*', 'texture', (err, assetInfos) => {
          for (let i = 0; i < assetInfos.length; ++i) {
            let item = assetInfos[i], path = item["path"], url = item["url"];
            if (path.indexOf("_tex.png")>-1) {
              this.items.push({
                path: path,
                url: url
              });
            }

          }
        });
      },
    }
  });
};

// panel/index.js, this filename needs to match the one registered in package.json
Editor.Panel.extend({
  template: Fs.readFileSync(PATH.html, 'utf-8'),
  style: Fs.readFileSync(PATH.style, 'utf-8'),

  $: {
    'warp': '#warp'
  },

  ready() {
    this.vm = createVM(this.$warp);
    this.vm.searchRes();
    ipcRenderer.on('init', (event, arg) => {
      this.vm.flag = true;
      this.vm.send();
    });
    ipcRenderer.on('close', (event, arg) => {
      this.vm.flag = false;
    })
  },
});