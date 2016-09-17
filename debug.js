/*
    Debug panels for javascript
    debug.js <https://github.com/davidfig/debug>
    Released under MIT license <https://github.com/davidfig/debug/blob/master/LICENSE>
    Author: David Figatner
    Copyright (c) 2016 YOPEY YOPEY LLC
*/

/** @class */
class Debug
{
    constructor()
    {
        this.defaultDiv = null;
        this.sides = {
            'leftTop': {isMinimized: localStorage.getItem('leftTop') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'leftTop'},
            'leftBottom': {isMinimized: localStorage.getItem('leftBottom') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'leftBottom'},
            'rightTop': {isMinimized: localStorage.getItem('rightTop') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'rightTop'},
            'rightBottom': {isMinimized: localStorage.getItem('rightBottom') === 'true', minimize: null, count: null, panels: [], minimized: [], dir: 'rightBottom'}
        };
    }

    /**
     * initialize the debug panels (must be called before adding panels)
     * options may also include options for the default debug panel (see this.add() for a list of these options)
     * @param {object} [options]
     * @param {number} [options.padding=7] between parent panels
     * @param {string} [options.color='rgba(150,150,150,0.5)'] - default CSS background color for panels
     * @return {HTMLElement} div where panel was created
     */
    init(options)
    {
        options = options || {};
        options.size = options.size || 0.25;
        options.expandable = options.expandable || 0.5;
        this.padding = options.panel || 7;
        this.defaultColor = options.color || 'rgba(150,150,150,0.5)';
        window.addEventListener('resize', this.resize.bind(this));
        window.addEventListener('error', this._error.bind(this));
        document.addEventListener('keypress', this._keypress.bind(this));
        return this.add('debug', options);
    }

    /**
     * change side of an existing panel
     * @param {HTMLElement} div - panel returned by Debug
     * @param {string} side
     */
    changeSide(div, sideName)
    {
        // remove from old side
        const panels = div.side.panels;
        delete panels[div.name];
        this._resizeSide(div.side);

        // add to new side
        const side = this._getSide({side: sideName});
        this._minimizeCreate(side);
        side.panels[div.name] = div;
        div.side = side;
        this._resizeSide(side);
    }

    /**
     * add debug panel
     * @param {string} name of panel
     * @param {object} [options]
     * @param {string} [options.side='rightBottom']  'rightBottom' (default), 'leftBottom', 'leftTop', 'rightTop'
     * @param {number} [options.expandable=0] or percent size to expand
     * @param {boolean} [options.default=false] if true then this panel replaces default for calls to debug and debugOne
     * @param {number} [options.size=0] if > 0 then this is the percent size of panel
     * @param {object} [style] - CSS styles for the panel
     * @param {string} [text] - starting text
     * @param {string} [parent] - attach to another panel (to the left or right, depending on the side of the panel)
     * @return {HTMLElement} div where panel was created
     */
    add(name, options)
    {
        options = options || {};
        const div = document.createElement('div');
        document.body.appendChild(div);
        div.name = name;
        div.options = options;
        if (!this.defaultDiv || options.default)
        {
            this.defaultDiv = div;
        }
        const side = this._getSide(options);
        const s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (this._isLeft(side))
        {
            s.left = 0;
        }
        else
        {
            s.right = 0;
        }
        if (options.style)
        {
            for (let key in options.style)
            {
                s[key] = options.style[key];
            }
        }
        this._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        this._style(div, side);
        div.click = this._handleClick;
        this._click(div);
        if (options.text)
        {
            div.innerHTML = options.text;
        }
        if (localStorage.getItem(side.dir + '-' + name) === 'true')
        {
            side.minimized.push(div);
        }
        this.resize();
        return div;
    }

    /**
     * creates a meter (useful for FPS)
     * @param {string} name of meter
     * @param {object} [options]
     * @param {string} [options.side=='leftBottom'] 'leftBottom', 'leftTop', 'rightBottom', 'rightTop'
     * @param {number} [options.width=100] in pixels
     * @param {number} [options.height=25] in pixels
     * @return {HTMLElement} div where panel was created
     */
    addMeter(name, options)
    {
        options = options || {};
        const div = document.createElement('canvas');
        div.type = 'meter';
        div.width = options.width || 100;
        div.height = options.height || 25;
        div.style.width = div.width + 'px';
        div.style.height = div.height + 'px';
        document.body.appendChild(div);
        div.name = name;
        div.options = options;
        const side = this._getSide(options);
        const s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (this._isLeft(side))
        {
            s.left = 0;
        }
        else
        {
            s.right = 0;
        }
        this._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        this._style(div, side);
        div.click = this._handleClick;
        this._click(div);
        if (options.text)
        {
            div.innerHTML = options.text;
        }
        this.resize();
        return div;
    }

    /**
     * adds a line to the end of the meter and scrolls the meter as necessary
     * must provide either an options.name or options.panel
     * @param {number} percent - between -1 and +1
     * @param {object} [options]
     * @param {string} [options.name] of panel to add the line
     * @param {object} [options.panel] - div of panel as returned by this.add()
     */
    meter(percent, options)
    {
        options = options || {};
        const div = this._getDiv(options);
        const c = div.getContext('2d');
        const data = c.getImageData(0, 0, div.width, div.height);
        c.putImageData(data, -1, 0);
        c.clearRect(div.width - 1, 0, div.width - 1, div.height);
        const middle = Math.round(div.height / 2);
        let height;
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

    /**
     * adds a panel with a browser link
     * note: this panel cannot be individually minimized
     * @param {string} name
     * @param {string} link
     * @param {object} [options]
     * @param {string} [options.side=='leftBottom'] 'leftBottom', 'leftTop', 'rightBottom', 'rightTop'
     * @param {number} [options.width=100] in pixels
     * @param {number} [options.height=25] in pixels
     * @param {object} [options.style] - additional css styles to apply to link
     * @return {HTMLElement} div where panel was created
     */
    addLink(name, link, options)
    {
        options = options || {};
        var div = document.createElement('div');
        document.body.appendChild(div);
        div.type = 'link';
        div.name = name;
        div.innerHTML = '<a style="color: white" target="_blank" href="' + link + '">' + name + '</a>';
        div.options = options;
        var side = this._getSide(options);
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        if (this._isLeft(side))
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
        this._minimizeCreate(side);
        div.side = side;
        side.panels[name] = div;
        this._style(div, side);
        div.click = this._handleClick;
        this._click(div);
        this.resize();
        return div;
    }

    /**
     * adds text to the end of in the panel and scrolls the panel
     * @param {string[]|...string} text - may be an array or you can include multiple strings: text1, text2, text3, [options]
     * @param {object} [options]
     * @param {string} [options.color] background color for text (in CSS)
     * @param {string} [options.name] of panel
     * @param {HTMLElement} [options.panel] returned from this.Add()
     * @param {boolean} [options.console=false] print to console instead of panel (useful for fast updating messages)
     */
    log()
    {
        var decoded = this._decode(arguments);
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
        var div = this._getDiv(options);
        if (options.color)
        {
            div.style.backgroundColor = options.color === 'error' ? 'red' : options.color;
        }
        else
        {
            div.style.backgroundColor = this.defaultColor;
        }
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
            this.defaultDiv.expanded = true;
            this.resize();
        }
    }

    /**
     * replaces all text in the panel
     * @param {string[]|...string} text - may be an array or you can include multiple strings: text1, text2, text3, [options]
     * @param {string} [options.name] of panel, defaults to defaultDiv
     * @param {HTMLElement} [options.panel] returned from this.Add()
     */
    one()
    {
        var decoded = this._decode(arguments);
        var text = decoded.text || [];
        var options = decoded.options || {};
        var div = this._getDiv(options);
        if (options.color)
        {
            div.style.backgroundColor = options.color;
        }
        else
        {
            div.style.backgroundColor = this.defaultColor;
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
    }

    /**
     * adds a debug message showing who called the function
     * @param {object} [options] (see this.debug)
     */
    caller(options)
    {
        if (arguments.callee.caller)
        {
            this.log('Called by: ' + arguments.callee.caller.arguments.callee.caller.name + ': ' + arguments.callee.caller.arguments.callee.caller.toString(), options);
        }
        else
        {
            this.log('Called by: top level', options);
        }
    }

    /**
     * returns a panel based on its name
     * @param {string} name of panel
     * @return {HTMLElement} panel or null if not found
     */
    get(name)
    {
        for (var side in this.sides)
        {
            if (this.sides[side].panels[name])
            {
                return this.sides[side].panels[name];
            }
        }
        return null;
    }

    /**
     * @param {string} dir to check
     */
    _checkResize(dir)
    {
        if (this.sides[dir].minimize)
        {
            this._resizeSide(this.sides[dir]);
        }
    }

    /**
     * resize all panels
     */
    resize()
    {
        this._checkResize('leftBottom');
        this._checkResize('rightBottom');
        this._checkResize('leftTop');
        this._checkResize('rightTop');
    }

    /**
     * converts side string to proper case and ordering for comparison
     * @params {object} options - as provided to this.add...()
     * @private
     */
    _getSide(options)
    {
        if (options.parent)
        {
            return options.parent.side;
        }
        const side = options.side;
        if (!side)
        {
            return this.sides['rightBottom'];
        }
        const change = side.toUpperCase();
        if (change === 'LEFTBOTTOM' || change === 'BOTTOMLEFT')
        {
            return this.sides['leftBottom'];
        }
        else if (change === 'RIGHTBOTTOM' || change === 'BOTTOMRIGHT')
        {
            return this.sides['rightBottom'];
        }
        else if (change === 'LEFTTOP' || change === 'TOPLEFT')
        {
            return this.sides['leftTop'];
        }
        else if (change === 'RIGHTTOP' || change === 'TOPRIGHT')
        {
            return this.sides['rightTop'];
        }
        else
        {
            return this.sides['rightBottom'];
        }
    }

    /**
     * returns correct div based on options
     * @private
     */
    _getDiv(options)
    {
        var div;
        if (!options.panel && !options.name)
        {
            div = this.defaultDiv;
        }
        else if (options.panel)
        {
            div = options.panel;
        }
        else
        {
            for (var name in this.sides)
            {
                var panel = this.sides[name].panels[options.name];
                if (panel)
                {
                    div = panel;
                    break;
                }
            }
        }
        if (!div)
        {
            div = this.defaultDiv;
        }
        return div;
    }

    /**
     * decodes this.log or this.one parameters
     * @param {Array} args
     * @private
     */
    _decode(args)
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
    }

    /**
     * creates a default style for a div
     * @param {HTMLElement} div
     * @param {object} side
     * @private
     */
    _style(div, side)
    {
        var s = div.style;
        s.fontFamily = 'Helvetica Neue';
        s.position = 'fixed';
        s.background = this.defaultColor;
        s.color = 'white';
        s.margin = 0;
        s.padding = '5px';
        s.boxShadow = (this._isLeft(side) ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
        s.cursor = 'pointer';
        s.wordWrap = 'break-word';
        s.overflow = 'auto';
        s.zIndex = 1000;
    }

    /**
     * creates the minimize button when adding the first panel for that side
     * @param {object} side
     * @private
     */
    _minimizeCreate(side)
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
        if (this._isLeft(side))
        {
            s.left = 0;
        }
        else
        {
            s.right = 0;
        }
        this._style(div, side);
        s.backgroundColor = 'transparent';
        s.boxShadow = null;
        s.padding = 0;
        side.minimize = div;
        var minimize = document.createElement('span');
        var count = document.createElement('span');
        minimize.click = this._handleMinimize;
        count.click = this._handleCount;
        if (this._isLeft(side))
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
        count.style.background = minimize.style.background = this.defaultColor;
        count.style.boxShadow = minimize.style.boxShadow = (this._isLeft ? '' : '-') + '5px -5px 10px rgba(0,0,0,0.25)';
        minimize.innerHTML = side.isMinimized ? '+' : '&mdash;';
        count.style.display = 'none';
        side.count = count;
        this._click(side.count, this._isLeft);
        this._click(minimize, this._isLeft);
    }

    /**
     * event listener for panels
     * @param {HTMLElement} div
     * @param {boolean} isLeft
     * @private
     */
    _click(div, isLeft)
    {
        div.addEventListener('click', div.click.bind(this));
        div.addEventListener('touchstart', div.click.bind(this));
        div.style.pointerEvents = 'auto';
        div.isLeft = isLeft;
    }

    /**
     * minimizes panel
     * @param {Event} e
     * @private
     */
    _handleMinimize(e)
    {
        var div = e.currentTarget;
        var side = e.currentTarget.offsetParent.side;
        side.isMinimized = !side.isMinimized;
        window.localStorage.setItem(side.dir, side.isMinimized);
        div.innerHTML = side.isMinimized ? '+' : '&mdash;';
        this.resize();
    }

    /**
     * provides count to display next to minimize button
     * @param {Event} e
     * @private
     */
    _handleCount(e)
    {
        var side = e.currentTarget.offsetParent.side;
        var div = side.minimized.pop();
        localStorage.setItem(div.side.dir + '-' + div.name, 'false');
        this.resize();
    }

    /**
     * handler for click
     * @param {Event} e
     * @private
     */
    _handleClick(e)
    {
        var div = e.currentTarget;
        if (div.type === 'link')
        {
            return;
        }
        else
        {
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
                    localStorage.setItem(div.side.dir + '-' + div.name, 'true');
                }
                else
                {
                    div.side.minimized.splice(index, 1);
                    localStorage.setItem(div.side.dir + '-' + div.name, 'false');
                }
            }
        }
        this.resize();
    }

    /**
     * resize individual side
     * @param {object} side returned by this._getSide()
     * @private
     */
    _resizeSide(side)
    {
        if (side.isMinimized)
        {
            for (var name in side.panels)
            {
                var panel = side.panels[name];
                panel.style.display = 'none';
            }
            if (this._isBottom(side))
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
                    if (this._isLeft(parent.side))
                    {
                        div.style.left = (parent.offsetLeft + parent.offsetWidth + this.padding) + 'px';
                    }
                    else
                    {
                        div.style.right = (window.innerWidth - parent.offsetLeft + this.padding) + 'px';
                    }
                }
                else
                {
                    if (this._isBottom(side))
                    {
                        div.style.bottom = current + 'px';
                        div.style.top = '';
                    }
                    else
                    {
                        div.style.top = current + 'px';
                        div.style.bottom = '';
                    }
                    if (this._isLeft(side))
                    {
                        div.style.left = '0px';
                        div.style.right = '';
                    }
                    else
                    {
                        div.style.right = '0px';
                        div.style.left = '';
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
    }

    /**
     * @param {object} side returned by this._getSide
     * @return {boolean} whether on the left side
     */
    _isLeft(side)
    {
        return side.dir.indexOf('left') !== -1;
    }

    /**
     * @param {object} side returned by this._getSide
     * @return {boolean} whether on the bottom side
     */
    _isBottom(side)
    {
        return side.dir.indexOf('Bottom') !== -1;
    }

    /**
     * handler for ` key used to expand default debug box
     * @param {Event} e
     */
    _keypress(e)
    {
        var code = (typeof e.which === 'number') ? e.which : e.keyCode;
        if (code === 96)
        {
            this._handleClick({currentTarget: this.defaultDiv});
        }
    }

    /**
     * handler for errors
     * @param {Event} e
     */
    _error(e)
    {
        console.error(e);
        this.log((e.message ? e.message : (e.error && e.error.message ? e.error.message : '')) + ' at ' + e.filename + ' line ' + e.lineno, {color: 'error'});
    }
};

module.exports = new Debug();

// for eslint
/* global document, localStorage, window, console */