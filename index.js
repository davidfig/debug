// for eslint
/* globals setInterval, XMLHttpRequest, window, document */

const Debug = require('@yy/debug');

Debug.init({color: 'rgba(180,150,150,0.5)'});

// adds a debug message on the default debug panel
Debug.log('This is a test message.');
Debug.log('This is a list', 'of messages', 'in one debug statement', 'useful for variables or watch statements', {color: 'green'});

// add an FPS panel and meter
const fps = Debug.add('FPS', {text: '0 FPS'});
const meter = Debug.addMeter('panel');

// adds another panel to the top right
const test = Debug.add('testing', {text: 'this panel was moved from right-top to left-top.', side: 'rightTop'});

// change side of testing panel
Debug.changeSide(test, 'topleft');

// add a link to top right
const link = Debug.addLink('github', 'https://github.com/davidfig/debug', {side: 'rightTop'});

// add a parent link to
Debug.addLink('issues', 'htps://github.com/davidfig/debug/issues', {parent: link});

const lower = Debug.add('lower', {text: 'Here\'s a panel in the lower left side.', side: 'leftBottom', size: 0.3});

// this will erase the previous message
Debug.one('Try pressing on a panel', 'or the minimize "-" button near a panel set', {panel: lower});

const text1 = Debug.add('text1', {text: 'text', side: 'leftBottom'});
const text2 = Debug.add('text2', {text: 'text-2', parent: text1});
const text3 = Debug.add('text3', {text: 'text-3', parent: text2});
Debug.add('text4', {text: 'text-4', parent: text3});

// update the FPS
setInterval(function () {
    const FPS = Math.random() * 60;
    Debug.meter(Math.random() * 2 - 1, {panel: meter});
    Debug.one(Math.round(FPS) + ' FPS', {panel: fps, color: (FPS < 30 ? 'red' : null)});
}, 60);

// shows the code in the demo page
window.onload = function()
{
    var client = new XMLHttpRequest();
    client.open('GET', 'index.js');
    client.onreadystatechange = function()
    {
        var code = document.getElementById('code');
        code.innerHTML = client.responseText;
        require('highlight.js').highlightBlock(code);
    };
    client.send();
};