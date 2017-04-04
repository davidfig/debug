## debug.js
debug panels for javascript (designed for game development)

## Code Example

    const Debug = require('@yy/debug');

    // initialize the library
    Debug.init();

    // send a message to the default panel created in the init()
    Debug.log('This is a test message.');

    // add an FPS panel and meter
    var fps = Debug.add('FPS', {text: '0 FPS', side: 'rightBottom'});
    var meter = Debug.addMeter('panel', {side: 'rightBottom'});

    // update the FPS
    setInterval(function () {
        var FPS = Math.random() * 60;

        // adds a meter line
        Debug.meter(Math.random() * 2 - 1, {panel: meter});

        // replaces all HTML in FPS panel
        Debug.one(Math.round(FPS) + ' FPS', {panel: fps, color: (FPS < 30 ? 'red' : null)});
    }, 60);

    Debug.add('testing', {text: 'this is another panel.'});

## Live Example
https://davidfig.github.io/debug/

see also

* https://davidfig.github.io/update/
* https://davidfig.github.io/animate/
* https://davidfig.github.io/renderer/
* https://davidfig.github.io/viewport/

## Installation
include debug.js in your project or add to your workflow

    npm install yy-debug

# API Reference
<a name="Debug"></a>

## Debug
**Kind**: global constant  

* [Debug](#Debug)
    * [.init([options])](#Debug.init) ⇒ <code>HTMLElement</code>
    * [.changeSide(div, side)](#Debug.changeSide)
    * [.remove(div)](#Debug.remove)
    * [.add(name, [options], [style], [text], [parent])](#Debug.add) ⇒ <code>HTMLElement</code>
    * [.addMeter(name, [options])](#Debug.addMeter) ⇒ <code>HTMLElement</code>
    * [.meter(percent, [options])](#Debug.meter)
    * [.addLink(name, link, [options])](#Debug.addLink) ⇒ <code>HTMLElement</code>
    * [.log(text, [options])](#Debug.log)
    * [.one(text)](#Debug.one)
    * [.caller([options])](#Debug.caller)
    * [.get(name)](#Debug.get) ⇒ <code>HTMLElement</code>
    * [._checkResize(dir)](#Debug._checkResize)
    * [.resize()](#Debug.resize)
    * [._isLeft(side)](#Debug._isLeft) ⇒ <code>boolean</code>
    * [._isBottom(side)](#Debug._isBottom) ⇒ <code>boolean</code>
    * [._keypress(e)](#Debug._keypress)
    * [._error(e)](#Debug._error)
    * [.clipboard(text)](#Debug.clipboard)

<a name="Debug.init"></a>

### Debug.init([options]) ⇒ <code>HTMLElement</code>
initialize the debug panels (must be called before adding panels)
options may also include options for the default debug panel (see Debug.add() for a list of these options)

**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>HTMLElement</code> - div where panel was created  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [options] | <code>object</code> |  |  |
| [options.padding] | <code>number</code> | <code>7</code> | between parent panels |
| [options.color] | <code>string</code> | <code>&quot;&#x27;rgba(150,150,150,0.5)&#x27;&quot;</code> | default CSS background color for panels |

<a name="Debug.changeSide"></a>

### Debug.changeSide(div, side)
change side of an existing panel

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| div | <code>HTMLElement</code> | panel returned by Debug |
| side | <code>string</code> |  |

<a name="Debug.remove"></a>

### Debug.remove(div)
remove a debug panel

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| div | <code>object</code> &#124; <code>string</code> | or name of panel |

<a name="Debug.add"></a>

### Debug.add(name, [options], [style], [text], [parent]) ⇒ <code>HTMLElement</code>
add debug panel

**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>HTMLElement</code> - div where panel was created  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | of panel |
| [options] | <code>object</code> |  |  |
| [options.side] | <code>string</code> | <code>&quot;&#x27;rightBottom&#x27;&quot;</code> | 'rightBottom' (default), 'leftBottom', 'leftTop', 'rightTop' |
| [options.expandable] | <code>number</code> | <code>0</code> | or percent size to expand |
| [options.default] | <code>boolean</code> | <code>false</code> | if true then this panel replaces default for calls to debug and debugOne |
| [options.size] | <code>number</code> | <code>0</code> | if > 0 then this is the percent size of panel |
| [style] | <code>object</code> |  | CSS styles for the panel |
| [text] | <code>string</code> |  | starting text |
| [parent] | <code>string</code> |  | attach to another panel (to the left or right, depending on the side of the panel) |

<a name="Debug.addMeter"></a>

### Debug.addMeter(name, [options]) ⇒ <code>HTMLElement</code>
creates a meter (useful for FPS)

**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>HTMLElement</code> - div where panel was created  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  | of meter |
| [options] | <code>object</code> |  |  |
| [options.side] | <code>string</code> | <code>&quot;=&#x27;leftBottom&#x27;&quot;</code> | 'leftBottom', 'leftTop', 'rightBottom', 'rightTop' |
| [options.width] | <code>number</code> | <code>100</code> | in pixels |
| [options.height] | <code>number</code> | <code>25</code> | in pixels |

<a name="Debug.meter"></a>

### Debug.meter(percent, [options])
adds a line to the end of the meter and scrolls the meter as necessary
must provide either an options.name or options.panel

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| percent | <code>number</code> | between -1 and +1 |
| [options] | <code>object</code> |  |
| [options.name] | <code>string</code> | of panel to add the line |
| [options.panel] | <code>object</code> | div of panel as returned by Debug.add() |

<a name="Debug.addLink"></a>

### Debug.addLink(name, link, [options]) ⇒ <code>HTMLElement</code>
adds a panel with a browser link
note: this panel cannot be individually minimized

**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>HTMLElement</code> - div where panel was created  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| name | <code>string</code> |  |  |
| link | <code>string</code> |  |  |
| [options] | <code>object</code> |  |  |
| [options.side] | <code>string</code> | <code>&quot;=&#x27;leftBottom&#x27;&quot;</code> | 'leftBottom', 'leftTop', 'rightBottom', 'rightTop' |
| [options.width] | <code>number</code> | <code>100</code> | in pixels |
| [options.height] | <code>number</code> | <code>25</code> | in pixels |
| [options.style] | <code>object</code> |  | additional css styles to apply to link |

<a name="Debug.log"></a>

### Debug.log(text, [options])
adds text to the end of in the panel and scrolls the panel

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| text | <code>Array.&lt;string&gt;</code> &#124; <code>string</code> |  | may be an array or you can include multiple strings: text1, text2, text3, [options] |
| [options] | <code>object</code> |  |  |
| [options.color] | <code>string</code> |  | background color for text (in CSS) |
| [options.name] | <code>string</code> |  | of panel |
| [options.debug] | <code>boolean</code> |  | invoke debugger from javascript |
| [options.panel] | <code>HTMLElement</code> |  | returned from Debug.Add() |
| [options.console] | <code>boolean</code> | <code>false</code> | print to console instead of panel (useful for fast updating messages) |

<a name="Debug.one"></a>

### Debug.one(text)
replaces all text in the panel

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| text | <code>Array.&lt;string&gt;</code> &#124; <code>string</code> | may be an array or you can include multiple strings: text1, text2, text3, [options] |
| [options.name] | <code>string</code> | of panel, defaults to defaultDiv |
| [options.debug] | <code>boolean</code> | invoke debugger from javascript |
| [options.panel] | <code>HTMLElement</code> | returned from Debug.Add() |

<a name="Debug.caller"></a>

### Debug.caller([options])
adds a debug message showing who called the function

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| [options] | <code>object</code> | (see Debug.debug) |

<a name="Debug.get"></a>

### Debug.get(name) ⇒ <code>HTMLElement</code>
returns a panel based on its name

**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>HTMLElement</code> - panel or null if not found  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | of panel |

<a name="Debug._checkResize"></a>

### Debug._checkResize(dir)
**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type | Description |
| --- | --- | --- |
| dir | <code>string</code> | to check |

<a name="Debug.resize"></a>

### Debug.resize()
resize all panels

**Kind**: static method of <code>[Debug](#Debug)</code>  
<a name="Debug._isLeft"></a>

### Debug._isLeft(side) ⇒ <code>boolean</code>
**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>boolean</code> - whether on the left side  

| Param | Type | Description |
| --- | --- | --- |
| side | <code>object</code> | returned by Debug._getSide |

<a name="Debug._isBottom"></a>

### Debug._isBottom(side) ⇒ <code>boolean</code>
**Kind**: static method of <code>[Debug](#Debug)</code>  
**Returns**: <code>boolean</code> - whether on the bottom side  

| Param | Type | Description |
| --- | --- | --- |
| side | <code>object</code> | returned by Debug._getSide |

<a name="Debug._keypress"></a>

### Debug._keypress(e)
handler for:
 ` key used to expand default debug box
 c/C key to copy contents of default div to clipboard

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

<a name="Debug._error"></a>

### Debug._error(e)
handler for errors

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type |
| --- | --- |
| e | <code>Event</code> | 

<a name="Debug.clipboard"></a>

### Debug.clipboard(text)
copies text to clipboard
called after pressing c or C (if input is allowed to bubble down)
from http://stackoverflow.com/questions/400212/how-do-i-copy-to-the-clipboard-in-javascript

**Kind**: static method of <code>[Debug](#Debug)</code>  

| Param | Type |
| --- | --- |
| text | <code>string</code> | 


* * *

Copyright (c) 2016 YOPEY YOPEY LLC - MIT License - Documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)