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

function init()
{
    add('debug', {size: 0.15, expandable: 0.5});
    window.addEventListener('resize', resize);
    // window.addEventListener('error', error);
    document.addEventListener('keypress', keypress);
}

// options {}
//  side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
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
    var side = sides[options.side || 'leftBottom'];
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
    var side = sides[options.side || 'leftBottom'];
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
// percent: between -1 to +1
// options {}
//  side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
//  width: defaults to 100px
//  height: default to 25px
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

// adds text to the end of in the panel and scrolls the panel
// options:
//      color: background color for text
//      name: name of panel
//      panel: panel returned from Debug.Add()
function debug(text, options)
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
    if (options.color)
    {
        div.style.backgroundColor = options.color === 'error' ? 'red' : options.color;
    }
    else
    {
        div.style.backgroundColor = 'rgba(150,150,150,0.5)';
    }
    var error = false;
    var result = '';
    result += '<span>';
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
    result += '</span>';
    div.innerHTML += result;
    div.scrollTop = div.scrollHeight;
//    if (color === 'error' )
    // if (error && minimized)
    // {
    //     openMessageBox();
    // }
}

// replaces all text in the panel
// options:
//      name: name of panel
//      panel: panel returned from Debug.Add()
function debugOne(text, options)
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
    if (options.color)
    {
        div.style.backgroundColor = options.color;
    }
    else
    {
        div.style.backgroundColor = 'rgba(150,150,150,0.5)';
    }
    var html = '<span>';
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
    div.innerHTML = html + '</span>';
    div.scrollTop = 0;
}

// adds a debug message showing who called the function
function caller()
{
    if (arguments.callee.caller)
    {
        debug('Called by: ' + arguments.callee.caller.arguments.callee.caller.name + ': ' + arguments.callee.caller.arguments.callee.caller.toString());
    }
    else
    {
        debug('Called by: top level');
    }
}

function style(div, side)
{
    var s = div.style;
    s.fontFamily = "Helvetica Neue";
    s.position = "fixed";
    s.background = "rgba(150,150,150,0.5)";
    s.color = "white";
    s.margin = 0;
    s.padding = "0.5%";
    s.boxShadow = (isLeft(side) ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
    s.cursor = 'pointer';
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
    if (isLeft)
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

/*
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

render: function(s, dirty)
{
    if (dirty !== s.dirty)
    {
        s.style.backgroundColor = s.style.color = s.dirty = dirty ? 'white' : 'black';
    }
},

addRenderCount: function()
{
    var s = document.createElement('span');
    var nodes = divRenderCount.childNodes;
    divRenderCount.insertBefore(s, nodes[nodes.length - 1]);
    return s;
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

initPercentages: function()
{
    percentages = add();
    percentages.innerHTML = '';
    other = ercentages('Other');
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
    init: init,
    add: add,
    addMeter: addMeter,
    meter: meter,
    caller: caller
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
