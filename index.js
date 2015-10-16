'use strict';
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');
const mkdirp = require('mkdirp');
const express = require('express');
const app = express();
const expressWs = require('express-ws')(app);
const watch = require('node-watch');
const PubSub = require('pubsub-js');

function error(str) { console.log('[!]', str); }
function success(str) { console.log('[+]', str); }

/*
    compiles a slide deck into the slides folder
    param: file, name of file ie 'file.md'
    param: theme, name of them ie 'mood'
*/
function compileSlide(file, theme) {
    const name = file.split('.')[0];
    const cmd = 'pandoc';
    const args = [
        '--standalone',
        '-t',
        'revealjs',
        '--variable=theme:' + theme,
        '--section-divs',
        '--template=libs/template.html',
        '--no-highlight',
        'markdown/' + name + '.md',
        '-o',
        'slides/' + name + '.html'
    ];

    const child = child_process.spawn(cmd, args);
    child.on('close', (code) => {
        if (code === 0) {
            success(name + '.md" slides compiled successfully');
        } else {
            error(name + '.md" slides failed to compile');
        }
    });
}

/*
    copies a file from the markdown directory to the slides directory
*/
function copyFile(filePath) {
    const devBaseName = 'markdown';
    const newPath = path.normalize('./slides/' + filePath.substr(devBaseName.length));
    mkdirp(path.dirname(newPath), (err) => {
        if (err) {
            error(path.basename(filePath) + ' failed to copy');
        } else {
            fs.createReadStream(filePath).pipe(fs.createWriteStream(newPath));
            success(path.basename(filePath) + ' copied successfully');
        }
    });
}

watch('./markdown/', function(filename) {
    if (path.extname(filename) === '.md' || path.extname(filename) === '.markdown') {
        compileSlide(path.basename(filename), 'simspace');
    } else {
        copyFile(path.normalize(filename));
    }

    PubSub.publish('delta', filename);
});

app.set('views', './views');
app.set('view engine', 'jade');
app.use('/libs', express.static(__dirname + '/libs'));
app.use('/js', express.static(__dirname + '/views'));
app.use('/slides', express.static(__dirname + '/slides'));

app.get('/', (req, res) => {
    fs.readdir('./slides/', (err, files) => {
        let ret = [];
        files.map( (name) => {
            if (path.extname(name) === '.html') {
                ret.push('#' + name);
            }
        });
        res.render('index', { title: 'Hey', files: ret});
    });
});

app.ws('/slide', (ws, req) => {
    ws.on('message', (message) => {
        const magic = path.basename(message.split('.')[0]);
        function observer(msg, data) {
            if (data.indexOf(magic) !== -1) {
                try {
                    ws.send('reload');
                } catch (err) {
                    ws.close();
                }
            }
        }
        const token = PubSub.subscribe('delta', observer);
    });
});

const server = app.listen(3000, function(){
    const host = server.address().address;
    const port = server.address().port;
    console.log('Server listening on :3000');
});
