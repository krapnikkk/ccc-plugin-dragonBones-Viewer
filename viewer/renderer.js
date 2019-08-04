const { ipcRenderer } = require('electron');
const fs = require('fs');
//事件监听
ipcRenderer.on('view', (event, path) => {
    dbData = [{ data: [], textureAtlasDatas: [], textureAtlases: [] }];
    if (path) {
        getImgBase64(path);
    } else {
        getImgBase64(__dirname + "/resource/demo/dragon_tex.png");
    }
})
window.onbeforeunload = function(e){
    Editor.Ipc.sendToWins('close', function (error, answer) { });
};
Editor.Ipc.sendToWins('init', function (error, answer) { });
function getImgBase64(path) {
    var base64;
    var img = document.createElement('img');
    var loadimg = new Image();
    loadimg.src = path;
    loadimg.onload = function () {
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var imgWidth = loadimg.width;
        var imgHeight = loadimg.height;
        canvas.width = imgWidth;
        canvas.height = imgHeight;
        ctx.drawImage(loadimg, 0, 0, imgWidth, imgHeight);
        base64 = canvas.toDataURL('image/png');
        img.src = base64;
        img.onload = function () {
            dbData[0].textureAtlases.push(img);
            loadRes(path);
        };
    };
    loadimg.onerror = function () {
        alert("龙骨图片资源路径错误或不存在！");
    }
}

function loadRes(path) {
    let ske_tex_path = path.replace(".png", ".json"), ske_ske_path = path.replace("_tex.png", "_ske.json");
    fs.readFile(ske_ske_path, 'utf-8', (err, data) => {
        if (err) {
            alert(err);
        } else {
            dbData[0].data = JSON.parse(data);
            fs.readFile(ske_tex_path, 'utf-8', (err, value) => {
                if (err) {
                    alert(err);
                } else {
                    dbData[0].textureAtlasDatas.push(JSON.parse(value));
                    egret.runEgret({ renderMode: "webgl", audioType: 0 });
                }
            });
        }
    });
}