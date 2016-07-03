/*
    Debug panels for javascript
    debug.js <https://github.com/davidfig/debug>
    Released under MIT license <https://github.com/davidfig/anglejs/license>
    Author: David Figatner
    Copyright (c) 2016 YOPEY YOPEY LLC
*/

var defaultDiv = null;
var left = {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], isLeft: true};
var right = {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], isLeft: false};

function init()
{
    add('debug', {size: 0.15/*, expandable: 0.5*/});
    window.addEventListener('error', error);
    window.addEventListener('resize', resize);
}

// options {}
//  side: 'left' (default) or 'right'
//  expandable: 0 (default) or percent size to expand
//  default: if true then this panel becomes default for calls to debug and debugOne
//  size: 0 (default) or percent size
function add(name, options)
{
    options = options || {};
    var div = document.createElement('div');
    document.body.appendChild(div);
    div.options = options;
    if (!defaultDiv || options.default)
    {
        defaultDiv = div;
    }
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    var side;
    if (options.side === 'right')
    {
        side = right;
        s.right = 0;
        if (!left.minimize)
        {
            minimizeCreate('right', false);
        }
    }
    else
    {
        side = left;
        s.left = 0;
        if (!right.minimize)
        {
            minimizeCreate('left', true);
        }
    }
    div.side = side;
    side.panels[name] = div;
    style(div);
    div.click = handleClick;
    click(div);
    resize();
    return div;
}

// replaces all text in the panel
// options:
//      name: name of panel
//      panel: panel returned from Debug.Add()
function debugOne(text, color, options)
{
    var div;
    options = options || {};
    if (!options.panel && !options.name)
    {
        div = defaultDiv;
    }
    else
    {
        div = options.panel || left.panels[options.name] || right.panels[options.name];
    }
    color = color || "rgb(100,100,100)";
    div.innerHTML = '<p style="background: ' + color + '">';
    if (typeof text === 'object')
    {
        for (var i = 0, _i = text.length; i < _i; i++)
        {
            div.innerHTML += text[i] + ((i !== _i -1) ? ', ' : '');
        }
    }
    else {
        div.innerHTML += text;
    }
    div.scrollTop = 0;
}

function style(div, isLeft)
{
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    s.background = "rgba(150,150,150,0.5)";
    s.color = "white";
    s.margin = 0;
    s.padding = "0.5%";
    s.boxShadow = (isLeft ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
    s.cursor = 'pointer';
}

function minimizeCreate(isLeft)
{
    var div = document.createElement('div');
    div.options = {};
    document.body.appendChild(div);
    var side = isLeft ? left : right;
    var s = div.style;
    if (isLeft)
    {
        s.left = 0;
        div.side = left;
    }
    else
    {
        s.right = 0;
        div.side = right;
    }
    style(div, isLeft);
    s.backgroundColor = 'transparent';
    s.boxShadow = null;
    s.padding = 0;
    side.minimize = div;
    var minimize = document.createElement('span');
    var count = document.createElement('span');
    minimize.click = handleMinimize;
    count.click = handleCount;
    div.appendChild(minimize);
    div.appendChild(count);
    if (isLeft)
    {
        count.style.marginLeft = '50%';
    }
    else
    {
        count.style.marginRight = '50%';
    }
    count.style.background = minimize.style.background = "rgba(150,150,150,0.5)";
    count.style.boxShadow = minimize.style.boxShadow = (isLeft ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
    count.style.padding = minimize.style.padding = '5px';
    minimize.innerHTML = "&mdash;";
    count.style.display = 'none';
    minimize.style
    side.count = count;
    click(side.count, isLeft);
    click(minimize, isLeft);
}

// set click events for panel
function click(div, isLeft)
{
    div.addEventListener('click', div.click);
    div.addEventListener('touchstart', div.click);
    div.style.pointerEvents = 'auto';
    div.isLeft = isLeft;
}

function handleMinimize(e)
{
    var div = e.currentTarget;
    var side = e.currentTarget.offsetParent.side;
    side.isMinimized = !side.isMinimized;
    div.innerHTML = side.isMinimized ? "+" : '&mdash;';
    resize();
}

function handleCount(e)
{
    var side = e.currentTarget.offsetParent.side;
    side.minimized.pop();
    resize();
}

function handleClick(e)
{
    var div = e.currentTarget;
    if (div.options.expandable)
    {
        div.expanded = !div.expanded;
    }
    else
    {
        var index = div.side.minimized.indexOf(div);
        if (index === -1)
        {
            div.side.minimized.push(div);
        }
        else
        {
            div.side.minimized.splice(index, 1);
        }
    }
    resize();
}

function resizeSide(side)
{
    if (side.isMinimized)
    {
        for (var name in side.panels)
        {
            var panel = side.panels[name];
            panel.style.display = 'none';
        }
        side.minimize.style.bottom = window.innerHeight / 2 + 'px';
        side.count.style.display = 'none';
    }
    else
    {
        var count = 0;
        var divs = [];
        for (var name in side.panels)
        {
            var panel = side.panels[name];
            if (side.minimized.indexOf(panel) === -1)
            {
                divs.push(panel);
            }
            else
            {
                panel.style.display = 'none';
                count++;
            }
        }
        divs.push(side.minimize);
        var max = Math.min(window.innerWidth, window.innerHeight);
        var current = 0;
        for (var i = 0; i < divs.length; i++)
        {
            var div = divs[i];
            div.style.bottom = current + 'px';
            if (div.options.size)
            {
                var size;
                if (div.options.expandable)
                {
                    size = max * (div.expanded ? div.options.expandable : div.options.size);
                }
                else
                {
                    size = max * div.options.size;
                }
                div.style.width = div.style.height = size + 'px';
                div.style.fontSize = div.options.size + '%';
                div.style.display = 'block';
            }
            div.scrollTop = div.scrollHeight;
            current += 10 + div.offsetHeight;
        }
        if (count === 0)
        {
            side.count.style.display = 'none';
        }
        else
        {
            side.count.style.display = 'inline';
            side.count.innerHTML = count;
        }
    }
}

function resize()
{
    if (left.minimize)
    {
        resizeSide(left);
    }
    if (right.minimize)
    {
        resizeSide(right);
    }
}

/*
// shows text in mesage box
// PARAMS: text may be a string or an array of strings
// if backgroundColor === 'error' then it uses red and maximizes message box
function debug(text, backgroundColor)
{
    color = color || "transparent";
    var error = false;
    if (backgroundColor === 'error')
    {
        error = true;
        color = 'red';
    }
    var result = '';
    result += '<p style="background: ' + backgroundColor + '">';
    if (text === null)
    {
        result += 'null';
    }
    else if (typeof text === 'object')
    {
        for (var i = 0; i < text.length; i++)
        {
            result += text[i] + ((i !== text.length -1) ? ', ' : '');
        }
    }
    else
    {
        result += text;
    }
    result += '</p>';
    messageBox.innerHTML += result;
    messageBox.scrollTop = messageBox.scrollHeight;
    if (error && minimized)
    {
        openMessageBox();
    }
}

fps: function(fps)
{
    divFPS.innerHTML = fps + " FPS";
    var mode = divFPS.mode;
    if (fps === 60 || fps === '--')
    {
        if (mode !== 'normal')
        {
            divFPS.style.backgroundColor = 'rgba(100,100,100,0.75)';
            mode = 'normal';
        }
    }
    else if (mode !== 'hot')
    {
        divFPS.style.backgroundColor = 'rgba(150,100,100,0.75)';
        mode = 'hot';
    }
},

animate: function(amount)
{
    divAnimate.innerHTML = amount + ' playing';
},

// Adds a render light and object counter for the renderer
// @return {object} returns the div to be passed to the render() function
addRender: function()
{
    var s = document.createElement('span');
    s.innerHTML = 'x';
    s.style.marginRight = '1px';
    s.style.backgroundColor = 'black';
    s.style.color = 'black';
    divRender.appendChild(s);
    s.dirty = 'black';
    renders.push(s);
    var count = addRenderCount();
    resize();
    return [s, count];
},

addRenderCount: function()
{
    var s = document.createElement('span');
    var nodes = divRenderCount.childNodes;
    divRenderCount.insertBefore(s, nodes[nodes.length - 1]);
    return s;
},

render: function(s, dirty)
{
    if (dirty !== s.dirty)
    {
        s.style.backgroundColor = s.style.color = s.dirty = dirty ? 'white' : 'black';
    }
},

renderCount: function(s, count)
{
    s.innerHTML = count + ' ';
},

// Turns off all render lights
renderOff: function()
{
    for (var i = 0, _i = renders.length; i < _i; i++)
    {
        var s = renders[i];
        s.style.backgroundColor = s.style.color = s.dirty = 'black';
    }
},

meter: function(percent)
{
    c = divMeter.getContext('2d');
    var data = c.getImageData(0, 0, 100, 25);
    c.putImageData(data, -1, 0);
    c.clearRect(99, 0, 99, 25);
    var height, middle = 19;
    if (percent < 0)
    {
        c.fillStyle = 'red';
        percent = Math.abs(percent);
        height = (25 - middle) * -percent;
        c.fillRect(99, middle, 99, middle + height);

    }
    else
    {
        c.fillStyle = 'white';
        height = middle * percent;
        c.fillRect(99, height, 99, middle - height);
    }
},

resize: function()
{
    var max = Math.min(window.innerWidth, window.innerHeight);
    var size = max * (minimized ? 0.15 : 0.6);
    div.style.width = div.style.height = size + "px";
    div.style.fontSize = (minimized ? "5%" : "100%");
    var divs = [
        divFPS,
        divRender,
        divRenderCount,
        divAnimate,
        divMeter
    ];
    for (var i = 0; i < extras.length; i++)
    {
        divs.push(extras[i]);
    }
    divs.push(divMinimize);
    var current = div.offsetHeight;
    for (var i = 0; i < divs.length; i++)
    {
        if (divs[i].style.display === 'block')
        {
            divs[i].style.bottom = current + 10 + 'px';
            current += 10 + divs[i].offsetHeight;
        }
    }
    div.scrollTop = div.scrollHeight;
},

styleDebug: function()
{
    var s = div.style;
    s.fontFamily = "Helvectica Neue";
    s.position = "fixed";
    if (leftRight === 'right')
    {
        s.right = 0;
    }
    else {
        s.left = 0;
    }
    s.bottom = 0;
    s.background = "rgba(100,100,100,0.75)";
    s.color = "white";
    s.padding = "10px";
    s.paddingTop = "5px";
    s.overflow = "auto";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
},

styleFPS: function()
{
    var s = divFPS.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (leftRight === 'right')
    {
        s.right = 0;
    }
    else {
        s.left = 0;
    }
    s.background = "rgba(150,150,150,0.75)";
    s.color = "white";
    s.padding = "5px";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
    divFPS.innerHTML = "-- FPS";
},

styleRender: function()
{
    var s = divRender.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (leftRight === 'right') s.right = 0;
    else s.left = 0;
    s.background = "rgba(150,150,150,0.75)";
    s.color = "white";
    s.padding = "5px";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
},

styleRenderCount: function()
{
    var s = divRenderCount.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (leftRight === 'right')
    {
        s.right = 0;
    }
    else
    {
        s.left = 0;
    }
    s.background = "rgba(150,150,150,0.75)";
    s.color = "white";
    s.padding = "5px";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
    divRenderCount.innerHTML = '<span> objects</span>';
},

styleAnimate: function()
{
    var s = divAnimate.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (leftRight === 'right')
    {
        s.right = 0;
    }
    else {
        s.left = 0;
    }
    s.background = "rgba(150,150,150,0.75)";
    s.color = "white";
    s.padding = "5px";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
    divAnimate.innerHTML = "0 Playing";
},

styleMeter: function()
{
    var s = divMeter.style;
    s.position = "fixed";
    if (leftRight === 'right')
    {
        s.right = 0;
    }
    else {
        s.left = 0;
    }
    s.background = "rgba(150,150,150,0.75)";
    s.padding = "5px";
    s.boxShadow = "-5px -5px 10px rgba(0,0,0,0.25)";
    divMeter.width = 100;
    divMeter.height = 25;
},

divCreate: function()
{
    div = document.createElement('div');
    div.draggable = true;
    document.body.appendChild(div);
    divFPS = document.createElement('div');
    document.body.appendChild(divFPS);
    divRender = document.createElement('div');
    document.body.appendChild(divRender);
    divRenderCount = document.createElement('div');
    document.body.appendChild(divRenderCount);
    divAnimate = document.createElement('div');
    document.body.appendChild(divAnimate);
    divMeter = document.createElement('canvas');
    document.body.appendChild(divMeter);
    divMinimize = document.createElement('div');
    document.body.appendChild(divMinimize);
    div.style.zIndex = divFPS.style.zIndex = divRender.style.zIndex = divAnimate.style.zIndex = divMeter.style.zIndex = divRenderCount.style.zIndex = divMinimize.style.zIndex = 100;
},

listener: function()
{
    div.addEventListener('click', handleClick);
    div.addEventListener('touchend', handleClick);
    div.style.pointerEvents = 'auto';
    divMinimize.addEventListener('click', handleState);
    divMinimize.addEventListener('touchend', handleState);
    divMinimize.style.pointerEvents = 'auto';
    window.addEventListener('error', error);
    window.addEventListener('resize', resize);
    document.addEventListener('keypress', keypress);
},

handleState: function()
{
    switch (state)
    {
        case '0':
            state = '1';
        break;
        case '1':
            state = '2';
        break;
        case '2':
            state = '0';
    }
    window.localStorage.setItem('state', state);
    changeState();
},

handleClick: function()
{
    if (state === '1')
    {
        state = '0';
    }
    minimized = !minimized;
    changeState();
},

error: function(e)
{
    console.log(e);
    error = e.error ? e.error.message : e.message;

    message(error + " at " + e.filename + " line " + e.lineno, "error");
},

// Captures ` key to expand debug box
keypress: function(e) {
    var code = (typeof e.which === "number") ? e.which : e.keyCode;
    if (code === 96)
    {
        handleClick();
    }
},

changeState: function()
{
    switch (state)
    {
        case '0':
            div.style.display = 'block';
            divFPS.style.display = 'block';
            divRender.style.display = 'none';
            divRenderCount.style.display = 'none';
            divAnimate.style.display = 'none';
            divMeter.style.display = 'none';
            divMinimize.style.display = 'block';
            divMinimize.innerHTML = '+';
            for (var i = 0; i < extras.length; i++)
            {
                extras[i].style.display = 'none';
            }
        break;
        case '1':
            div.style.display = 'none';
            divFPS.style.display = 'none';
            divRender.style.display = 'none';
            divRenderCount.style.display = 'none';
            divAnimate.style.display = 'none';
            divMeter.style.display = 'none';
            divMinimize.style.display = 'block';
            divMinimize.innerHTML = '+';
            for (var i = 0; i < extras.length; i++)
            {
                extras[i].style.display = 'none';
            }
        break;
        case '2':
            div.style.display = 'block';
            divFPS.style.display = 'block';
            divRender.style.display = 'block';
            divRenderCount.style.display = 'block';
            divAnimate.style.display = 'block';
            divMeter.style.display = 'block';
            divMinimize.style.display = 'block';
            divMinimize.innerHTML = '&mdash;';
            for (var i = 0; i < extras.length; i++)
            {
                extras[i].style.display = 'block';
            }
        break;
    }
    resize();
},

caller: function()
{
    message(arguments.callee.caller.arguments.callee.caller.name + ': ' +
        arguments.callee.caller.arguments.callee.caller.toString());
},

initPercentages: function()
{
    percentages = add();
    percentages.innerHTML = '';
    other = addPercentages('Other');
},

addPercentages: function(name)
{
    var div = document.createElement('div');
    percentages.insertBefore(div, percentages.firstChild);
    var nameSpan = document.createElement('span');
    div.appendChild(nameSpan);
    nameSpan.innerHTML = name + ': ';
    var amount = document.createElement('span');
    div.appendChild(amount);
    amount.innerHTML = '--';
    var percent = document.createElement('span');
    div.appendChild(percent);
    percent.innerHTML = '%';
    percentageList[name] = {span: amount, current: 0, amounts: []};
    resize();
},

changePercent: function(name, percent)
{
    var change = percentageList[name];
    change.amounts[change.current++] = percent;
    if (change.current === rollingAverage)
    {
        change.current = 0;
    }
    var total = 0;
    for (var i = 0; i < change.amounts.length; i++)
    {
        total += change.amounts[i];
    }
    change.span.innerHTML = Math.round(total / change.amounts.length);
}

*/

// exports
var Debug = {
    add: add,
    init: init
};

// add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd)
{
    define(function()
    {
        return {
            Debug: Debug,
            // debug: message,
            // debugOne: messageOne
        };
    });
}

// add support for CommonJS libraries such as browserify.
if (typeof exports !== 'undefined')
{
    exports.Debug = Debug;
    // exports.debug = message;
    // exports.debugOne = messageOne;
}

// define globally in case AMD is not available or available but not used
if (typeof window !== 'undefined')
{
    window.Debug = Debug;
    // window.debug = message;
    // window.debugOne = messageOne;
}
