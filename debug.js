/*
    Debug panels for javascript
    debug.js <https://github.com/davidfig/debug>
    Released under MIT license <https://github.com/davidfig/anglejs/license>
    Author: David Figatner
    Copyright (c) 2016 YOPEY YOPEY LLC
*/

var defaultDiv = null;
var sides = {
    'leftTop': {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], dir: 'leftTop'},
    'leftBottom': {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], dir: 'leftBottom'},
    'rightTop': {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], dir: 'rightTop'},
    'rightBottom': {isMinimized: false, minimize: null, count: null, panels: [], minimized: [], dir: 'rightBottom'}
};

// options for the default debug panel (see add())
function init(options)
{
    options = options || {};
    if (!options.size)
    {
        options.size = 0.25;
    }
    if (!options.expandable)
    {
        options.expandable = 0.5;
    }
    add('debug', options);
    window.addEventListener('resize', resize);
    window.addEventListener('error', error);
    document.addEventListener('keypress', keypress);
}

// converts side
function getSide(side)
{
    if (!side)
    {
        return sides['rightBottom'];
    }
    var change = side.toUpperCase();
    if (change === 'LEFTBOTTOM' || change === 'BOTTOMLEFT')
    {
        return sides['leftBottom'];
    }
    else if (change === 'RIGHTBOTTOM' || change === 'BOTTOMRIGHT')
    {
        return sides['rightBottom'];
    }
    else if (change === 'LEFTTOP' || change === 'TOPLEFT')
    {
        return sides['leftTop'];
    }
    else if (change === 'RIGHTTOP' || change === 'TOPRIGHT')
    {
        return sides['rightTop'];
    }
    else
    {
        return sides['rightBottom'];
    }
}

// options {}
//  side: 'rightBottom' (default), 'leftBottom', 'leftTop', 'rightTop'
//  expandable: 0 (default) or percent size to expand
//  default: if true then this panel becomes default for calls to debug and debugOne
//  size: 0 (default) or percent size
//  style: object with CSS styles for the panel
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
    var side = getSide(options.side);
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (isLeft(side))
    {
        s.left = 0;
    }
    else
    {
        s.right = 0;
    }
    if (options.style)
    {
        for (var key in options.style)
        {
            s[key] = options.style[key];
        }
    }
    minimizeCreate(side);
    div.side = side;
    side.panels[name] = div;
    style(div, side);
    div.click = handleClick;
    click(div);
    if (options.text)
    {
        div.innerHTML = options.text;
    }
    resize();
    return div;
}

// options {}
//  side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
//  width: defaults to 100px
//  height: default to 25px
function addMeter(name, options)
{
    options = options || {};
    var div = document.createElement('canvas');
    div.type = 'meter';
    div.width = options.width || 100;
    div.height = options.height || 25;
    div.style.width = div.width + 'px';
    div.style.height = div.height + 'px';
    document.body.appendChild(div);
    div.options = options;
    var side = getSide(options.side);
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    if (isLeft(side))
    {
        s.left = 0;
    }
    else
    {
        s.right = 0;
    }
    minimizeCreate(side);
    div.side = side;
    side.panels[name] = div;
    style(div, side);
    div.click = handleClick;
    click(div);
    if (options.text)
    {
        div.innerHTML = options.text;
    }
    resize();
    return div;
}

// adds a line to the end of the meter and scrolls the meter as necessary
//      percent: between -1 to +1
//      name: name of panel
//      panel: panel returned from Debug.Add()
function meter(percent, options)
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
    c = div.getContext('2d');
    var data = c.getImageData(0, 0, div.width, div.height);
    c.putImageData(data, -1, 0);
    c.clearRect(div.width - 1, 0, div.width - 1, div.height);
    var height, middle = Math.round(div.height / 2);
    if (percent < 0)
    {
        c.fillStyle = 'red';
        percent = Math.abs(percent);
        height = (25 - middle) * -percent;
        c.fillRect(div.width - 1, middle, div.width - 1, middle + height);
    }
    else
    {
        c.fillStyle = 'white';
        height = middle * percent;
        c.fillRect(div.width - 1, height, div.width - 1, middle - height);
    }
}

function getDiv(options)
{
    var div;
    if (!options.panel && !options.name)
    {
        div = defaultDiv;
    }
    else if (options.panel)
    {
        div = options.panel;
    }
    else
    {
        for (var name in sides)
        {
            var panel = sides[name].panels[options.name];
            if (panel)
            {
                div = panel;
                break;
            }
        }
    }
    if (!div)
    {
        div = defaultDiv;
    }
    return div;
}

// adds text to the end of in the panel and scrolls the panel
// options:
//      color: background color for text
//      name: name of panel
//      panel: panel returned from Debug.Add()
function debug(text, options)
{
    options = options || {};
    var div = getDiv(options);
    if (options.color)
    {
        div.style.backgroundColor = options.color === 'error' ? 'red' : options.color;
    }
    else
    {
        div.style.backgroundColor = 'rgba(150,150,150,0.5)';
    }
    var error = false;
    var result = '<p style="pointer-events: none">';
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
    div.innerHTML += result;
    div.scrollTop = div.scrollHeight;
    if (options.color === 'error')
    {
        defaultDiv.expanded = true;
        resize();
    }
}

// replaces all text in the panel
// options:
//      name: name of panel
//      panel: panel returned from Debug.Add()
function debugOne(text, options)
{
    options = options || {};
    var div = getDiv(options);
    if (options.color)
    {
        div.style.backgroundColor = options.color;
    }
    else
    {
        div.style.backgroundColor = 'rgba(150,150,150,0.5)';
    }
    var html = '<span style="pointer-events: none">';
    if (typeof text === 'object')
    {
        for (var i = 0, _i = text.length; i < _i; i++)
        {
            html += text[i] + ((i !== _i -1) ? ', ' : '');
        }
    }
    else
    {
        html += text;
    }
    html += '</span>';
    div.innerHTML = html;
}

// adds a debug message showing who called the function
function caller(options)
{
    if (arguments.callee.caller)
    {
        debug('Called by: ' + arguments.callee.caller.arguments.callee.caller.name + ': ' + arguments.callee.caller.arguments.callee.caller.toString(), options);
    }
    else
    {
        debug('Called by: top level', options);
    }
}

// returns a panel based on its name
function get(name)
{
    for (side in sides)
    {
        if (sides[side].panels[name])
        {
            return sides[side].panels[name];
        }
    }
    return null;
}

function style(div, side)
{
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    s.background = "rgba(150,150,150,0.5)";
    s.color = "white";
    s.margin = 0;
    s.padding = "5px";
    s.boxShadow = (isLeft(side) ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
    s.cursor = 'pointer';
    s.wordWrap = 'break-word';
    s.overflow = 'auto';
    s.zIndex = 1000;
}

function minimizeCreate(side)
{
    if (side.minimize)
    {
        return;
    }
    var div = document.createElement('div');
    div.options = {};
    document.body.appendChild(div);
    var s = div.style;
    div.side = side;
    if (isLeft(side))
    {
        s.left = 0;
    }
    else
    {
        s.right = 0;
    }
    style(div, side);
    s.backgroundColor = 'transparent';
    s.boxShadow = null;
    s.padding = 0;
    side.minimize = div;
    var minimize = document.createElement('span');
    var count = document.createElement('span');
    minimize.click = handleMinimize;
    count.click = handleCount;
    if (isLeft(side))
    {
        div.appendChild(minimize);
        div.appendChild(count);
        count.style.marginLeft = '20px';
    }
    else
    {
        div.appendChild(count);
        div.appendChild(minimize);
        count.style.marginRight = '20px';
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
        if (isBottom(side))
        {
            side.minimize.style.bottom = window.innerHeight / 4 + 'px';
        }
        else
        {
            side.minimize.style.top = window.innerHeight / 4 + 'px';
        }
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
                panel.style.display = 'block';
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
            if (isBottom(side))
            {
                div.style.bottom = current + 'px';
            }
            else
            {
                div.style.top = current + 'px';
            }
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
    function side(dir)
    {
        if (sides[dir].minimize)
        {
            resizeSide(sides[dir]);
        }
    }
    side('leftBottom');
    side('rightBottom');
    side('leftTop');
    side('rightTop');
}

function isLeft(side)
{
    return side.dir.indexOf('left') !== -1;
}

function isBottom(side)
{
    return side.dir.indexOf('Bottom') !== -1;
}

// Captures ` key to expand default debug box
function keypress(e)
{
    var code = (typeof e.which === "number") ? e.which : e.keyCode;
    if (code === 96)
    {
        handleClick({currentTarget: defaultDiv});
    }
}

function error(e)
{
    console.log(e);
    debug((e.message ? e.message : (e.error && e.error.message ? e.error.message : '')) + " at " + e.filename + " line " + e.lineno, {color: "error"});
}

// exports
var Debug = {
    init: init,
    add: add,
    addMeter: addMeter,
    meter: meter,
    get: get,
    resize: resize,
    caller: caller
};

// add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd)
{
    define(function()
    {
        return {
            Debug: Debug,
            debug: debug,
            debugOne: debugOne
        };
    });
}

// add support for CommonJS libraries such as browserify.
if (typeof exports !== 'undefined')
{
    exports.Debug = Debug;
    exports.debug = debug;
    exports.debugOne = debugOne;
}

// define globally in case AMD is not available or available but not used
if (typeof window !== 'undefined')
{
    window.Debug = Debug;
    window.debug = debug;
    window.debugOne = debugOne;
}