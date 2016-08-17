// Debug panels for javascript
// debug.js <https://github.com/davidfig/debug>
// Released under MIT license <https://github.com/davidfig/debug/license>
// Author: David Figatner
// Copyright (c) 2016 YOPEY YOPEY LLC

var Debug = {

    defaultDiv: null,
    sides: {
        'leftTop': {isMinimized: localStorage.getItem('leftTop') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'leftTop'},
        'leftBottom': {isMinimized: localStorage.getItem('leftBottom') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'leftBottom'},
        'rightTop': {isMinimized: localStorage.getItem('rightTop') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'rightTop'},
        'rightBottom': {isMinimized: localStorage.getItem('rightBottom') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'rightBottom'}
    },
    defaultColor: 'rgba(150,150,150,0.5)',
    padding: 7,

    // options for the default debug panel (see add())
    //  padding {number} between parent panels
    //  color {string} CSS color for default background of panels
    init: function(options)
    {
        options = options || {};
        options.size = options.size || 0.25;
        options.expandable = options.expandable || 0.5;
        Debug.padding = options.panel || Debug.padding;
        Debug.defaultColor = options.color || Debug.defaultColor;
        Debug.add('debug', options);
        window.addEventListener('resize', Debug.resize);
        window.addEventListener('error', Debug._error);
        document.addEventListener('keypress', Debug._keypress);
    },

    // converts side
    _getSide: function(options)
    {
        if (options.parent)
        {
            return options.parent.side;
        }
        var side = options.side;
        if (!side)
        {
            return Debug.sides['rightBottom'];
        }
        var change = side.toUpperCase();
        if (change === 'LEFTBOTTOM' || change === 'BOTTOMLEFT')
        {
            return Debug.sides['leftBottom'];
        }
        else if (change === 'RIGHTBOTTOM' || change === 'BOTTOMRIGHT')
        {
            return Debug.sides['rightBottom'];
        }
        else if (change === 'LEFTTOP' || change === 'TOPLEFT')
        {
            return Debug.sides['leftTop'];
        }
        else if (change === 'RIGHTTOP' || change === 'TOPRIGHT')
        {
            return Debug.sides['rightTop'];
        }
        else
        {
            return Debug.sides['rightBottom'];
        }
    },

    // options {}
    //  side: 'rightBottom' (default), 'leftBottom', 'leftTop', 'rightTop'
    //  expandable: 0 (default) or percent size to expand
    //  default: if true then this panel becomes default for calls to debug and debugOne
    //  size: 0 (default) or percent size
    //  style: object with CSS styles for the panel
    //  text: starting text
    add: function(name, options)
    {
        options = options || {};
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.name = name;
        div.options = options;
        if (!Debug.defaultDiv || options.default)
        {
            Debug.defaultDiv = div;
        }
        var side = Debug._getSide(options);
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (Debug._isLeft(side))
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
        Debug._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        Debug._style(div, side);
        div.click = Debug._handleClick;
        Debug._click(div);
        if (options.text)
        {
            div.innerHTML = options.text;
        }
        if (localStorage.getItem(side.dir + '-' + name) === 'true')
        {
            side.minimized.push(div);
        }
        Debug.resize();
        return div;
    },

    // options {}
    //  side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
    //  width: defaults to 100px
    //  height: default to 25px
    addMeter: function(name, options)
    {
        options = options || {};
        var div = document.createElement('canvas');
        div.type = 'meter';
        div.width = options.width || 100;
        div.height = options.height || 25;
        div.style.width = div.width + 'px';
        div.style.height = div.height + 'px';
        document.body.appendChild(div);
        div.name = name;
        div.options = options;
        var side = Debug._getSide(options);
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (Debug._isLeft(side))
        {
            s.left = 0;
        }
        else
        {
            s.right = 0;
        }
        Debug._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        Debug._style(div, side);
        div.click = Debug._handleClick;
        Debug._click(div);
        if (options.text)
        {
            div.innerHTML = options.text;
        }
        Debug.resize();
        return div;
    },

    // adds a line to the end of the meter and scrolls the meter as necessary
    //      percent: between -1 to +1
    //      name: name of panel
    //      panel: panel returned from Debug.Add()
    meter: function(percent, options)
    {
        var div;
        options = options || {};
        if (!options.panel && !options.name)
        {
            div = Debug.defaultDiv;
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
    },

    //  name: name of panel and text displayed
    //  link: html link to open when clicked
    //  options:
    //      side: 'rightBottom' (default), 'leftBottom', 'leftTop', 'rightTop'
    //      size: 0 (default) or percent size
    //      style: object with CSS styles for the panel
    addLink: function(name, link, options)
    {
        options = options || {};
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.type = 'link';
        div.name = name;
        div.innerHTML = '<a style="color: white" target="_blank" href="' + link + '">' + name + '</a>';
        div.options = options;
        var side = Debug._getSide(options);
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (Debug._isLeft(side))
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
        Debug._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        Debug._style(div, side);
        div.click = Debug._handleClick;
        Debug._click(div);
        Debug.resize();
        return div;
    },

    _getDiv: function(options)
    {
        var div;
        if (!options.panel && !options.name)
        {
            div = Debug.defaultDiv;
        }
        else if (options.panel)
        {
            div = options.panel;
        }
        else
        {
            for (var name in Debug.sides)
            {
                var panel = Debug.sides[name].panels[options.name];
                if (panel)
                {
                    div = panel;
                    break;
                }
            }
        }
        if (!div)
        {
            div = Debug.defaultDiv;
        }
        return div;
    },

    _decode: function(args)
    {
        var options, text = [], i;

        // handle old style where first argument can be an array
        if (Array.isArray(args[0]))
        {
            text = args[0];
            i = 1;
        }
        else
        {
            i = 0;
        }
        for (; i < args.length; i++)
        {
            // last one may be options
            if (i === args.length - 1)
            {
                if (typeof args[i] === 'object' && args[i] !== null && !Array.isArray(arguments[i]))
                {
                    options = args[i];
                }
                else
                {
                    text.push(args[i]);
                }
            }
            else
            {
                text.push(args[i]);
            }
        }
        return {text: text, options: options};
    },

    // adds text to the end of in the panel and scrolls the panel
    // first argument may be an array or you can include multiple strings: text1, text2, text3, [options]
    // options:
    //      color: background color for text
    //      name: name of panel
    //      panel: panel returned from Debug.Add()
    //      console: false (default) - print to console instead of panel (useful for lots of messages)
    debug: function()
    {
        var decoded = Debug._decode(arguments);
        var text = decoded.text;
        var options = decoded.options || {};
        if (options.console)
        {
            var result = '';
            for (var i = 0; i < text.length; i++)
            {
                result += text[i] + ((i !== text.length -1) ? ', ' : '');
            }
            console.log(result);
            return;
        }
        var div = Debug._getDiv(options);
        if (options.color)
        {
            div.style.backgroundColor = options.color === 'error' ? 'red' : options.color;
        }
        else
        {
            div.style.backgroundColor = Debug.defaultColor;
        }
        var error = false;
        var result = '<p style="pointer-events: none">';
        if (text.length === 0)
        {
            result += 'null';
        }
        else
        {
            for (var i = 0; i < text.length; i++)
            {
                result += text[i] + ((i !== text.length -1) ? ', ' : '');
            }
        }
        result += '</p>';
        div.innerHTML += result;
        div.scrollTop = div.scrollHeight;
        if (options.color === 'error')
        {
            Debug.defaultDiv.expanded = true;
            Debug.resize();
        }
    },

    // replaces all text in the panel
    // first argument may be an array or you can include multiple strings: text1, text2, text3, [options]
    // options:
    //      name: name of panel
    //      panel: panel returned from Debug.Add()
    debugOne: function()
    {
        var decoded = Debug._decode(arguments);
        var text = decoded.text || [];
        var options = decoded.options || {};
        var div = Debug._getDiv(options);
        if (options.color)
        {
            div.style.backgroundColor = options.color;
        }
        else
        {
            div.style.backgroundColor = Debug.defaultColor;
        }
        var html = '<span style="pointer-events: none">';
        if (text.length === 0)
        {
            html += 'null';
        }
        else
        {
            for (var i = 0; i < text.length; i++)
            {
                html += text[i] + ((i !== text.length -1) ? ', ' : '');
            }
        }
        html += '</span>';
        div.innerHTML = html;
    },

    // adds a debug message showing who called the function
    caller: function(options)
    {
        if (arguments.callee.caller)
        {
            debug('Called by: ' + arguments.callee.caller.arguments.callee.caller.name + ': ' + arguments.callee.caller.arguments.callee.caller.toString(), options);
        }
        else
        {
            debug('Called by: top level', options);
        }
    },

    // returns a panel based on its name
    get: function(name)
    {
        for (var side in Debug.sides)
        {
            if (Debug.sides[side].panels[name])
            {
                return Debug.sides[side].panels[name];
            }
        }
        return null;
    },

    _style: function(div, side)
    {
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        s.background = Debug.defaultColor;
        s.color = 'white';
        s.margin = 0;
        s.padding = '5px';
        s.boxShadow = (Debug._isLeft(side) ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
        s.cursor = 'pointer';
        s.wordWrap = 'break-word';
        s.overflow = 'auto';
        s.zIndex = 1000;
    },

    _minimizeCreate: function(side)
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
        if (Debug._isLeft(side))
        {
            s.left = 0;
        }
        else
        {
            s.right = 0;
        }
        Debug._style(div, side);
        s.backgroundColor = 'transparent';
        s.boxShadow = null;
        s.padding = 0;
        side.minimize = div;
        var minimize = document.createElement('span');
        var count = document.createElement('span');
        minimize.click = Debug._handleMinimize;
        count.click = Debug._handleCount;
        if (Debug._isLeft(side))
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
        count.style.background = minimize.style.background = Debug.defaultColor;
        count.style.boxShadow = minimize.style.boxShadow = (Debug._isLeft ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
        minimize.innerHTML = side.isMinimized ? '+' : '&mdash;';
        count.style.display = 'none';
        side.count = count;
        Debug._click(side.count, Debug._isLeft);
        Debug._click(minimize, Debug._isLeft);
    },

    // set click events for panel
    _click: function(div, isLeft)
    {
        div.addEventListener('click', div.click);
        div.addEventListener('touchstart', div.click);
        div.style.pointerEvents = 'auto';
        div.isLeft = isLeft;
    },

    _handleMinimize: function(e)
    {
        var div = e.currentTarget;
        var side = e.currentTarget.offsetParent.side;
        side.isMinimized = !side.isMinimized;
        window.localStorage.setItem(side.dir, side.isMinimized);
        div.innerHTML = side.isMinimized ? '+' : '&mdash;';
        Debug.resize();
    },

    _handleCount: function(e)
    {
        var side = e.currentTarget.offsetParent.side;
        var div = side.minimized.pop();
        localStorage.setItem(div.side.dir + '-' + div.name, 'false');
        Debug.resize();
    },

    _handleClick: function(e)
    {
        var div = e.currentTarget;
        if (div.type === 'link')
        {
            return;
        }
        else if (div.options.expandable)
        {
            div.expanded = !div.expanded;
        }
        else
        {
            var index = div.side.minimized.indexOf(div);
            if (index === -1)
            {
                div.side.minimized.push(div);
                localStorage.setItem(div.side.dir + '-' + div.name, 'true');
            }
            else
            {
                div.side.minimized.splice(index, 1);
                localStorage.setItem(div.side.dir + '-' + div.name, 'false');
            }
        }
        Debug.resize();
    },

    resizeSide: function(side)
    {
        if (side.isMinimized)
        {
            for (var name in side.panels)
            {
                var panel = side.panels[name];
                panel.style.display = 'none';
            }
            if (Debug._isBottom(side))
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
                if (div.options.parent && (side.minimized.indexOf(div.options.parent) === -1))
                {
                    var parent = div.options.parent;
                    div.style.top = parent.style.top;
                    div.style.bottom = parent.style.bottom;
                    if (Debug._isLeft(parent.side))
                    {
                        div.style.left = (parent.offsetLeft + parent.offsetWidth + Debug.padding) + 'px';
                    }
                    else
                    {
                        div.style.right = (window.innerWidth - parent.offsetLeft + Debug.padding) + 'px';
                    }
                }
                else
                {
                    if (Debug._isBottom(side))
                    {
                        div.style.bottom = current + 'px';
                    }
                    else
                    {
                        div.style.top = current + 'px';
                    }
                    if (Debug._isLeft(side))
                    {
                        div.style.left = '0px';
                    }
                    else
                    {
                        div.style.right = '0px';
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
    },

    resize: function()
    {
        function side(dir)
        {
            if (Debug.sides[dir].minimize)
            {
                Debug.resizeSide(Debug.sides[dir]);
            }
        }
        side('leftBottom');
        side('rightBottom');
        side('leftTop');
        side('rightTop');
    },

    _isLeft: function(side)
    {
        return side.dir.indexOf('left') !== -1;
    },

    _isBottom: function(side)
    {
        return side.dir.indexOf('Bottom') !== -1;
    },

    // Captures ` key to expand default debug box
    _keypress: function(e)
    {
        var code = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (code === 96)
        {
            Debug._handleClick({currentTarget: Debug.defaultDiv});
        }
    },

    _error: function(e)
    {
        console.error(e);
        debug((e.message ? e.message : (e.error && e.error.message ? e.error.message : '')) + ' at ' + e.filename + ' line ' + e.lineno, {color: 'error'});
    }
};

// add support for AMD (Asynchronous Module Definition) libraries such as require.js.
if (typeof define === 'function' && define.amd)
{
    define(function()
    {
        return {
            Debug: Debug,
            debug: Debug.debug,
            debugOne: Debug.debugOne
        };
    });
}

// add support for CommonJS libraries such as browserify.
if (typeof exports !== 'undefined')
{
    module.exports = Debug;
    window.debug = Debug.debug;
    window.debugOne = Debug.debugOne;
}

// define globally in case AMD is not available or available but not used
if (typeof window !== 'undefined')
{
    window.Debug = Debug;
    window.debug = Debug.debug;
    window.debugOne = Debug.debugOne;
}