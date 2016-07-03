## debug.js
debug panels for javascript apps (particularly useful for game development)

## Code Example

    // initialize the library
    Debug.init();

    // send a message to the default panel created in the init()
    debug('This is a test message.');

    // add an FPS panel and meter
    var fps = Debug.add('FPS', {text: '0 FPS', side: 'rightBottom'});
    var meter = Debug.addMeter('panel', {side: 'rightBottom'});

    // update the FPS
    setInterval(function () {
        var FPS = Math.random() * 60;
        Debug.meter(Math.random() * 2 - 1, {panel: meter});
        debugOne(Math.round(FPS) + ' FPS', {panel: fps, color: (FPS < 30 ? 'red' : null)});
    }, 60);

    Debug.add('testing', {text: 'this is another panel.'});

## Installation
include debug.js in your project or add to your workflow

    <script src="debug.js"></script>

## Example
https://davidfig.github.io/debug/

## API Reference

### Debug.init(options)
initializes Debug and creates default debug panel
options for the default panel (see Debug.add())
attaches to the following events:
     window.resize: resizes panels
     window.error: shows error in the default panel
     document.keypress: captures ` key to change size of default panel

### Debug.add(name, options)
Adds a debug panel
options {}
 side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
 expandable: 0 (default) or percent size to expand
 default: if true then this panel becomes default for calls to debug and debugOne
 size: 0 (default) or percent size

###Debug.addMeter(name, options)
Adds a meter panel
* options {}
  - side: 'leftBottom' (default), 'leftTop', 'rightBottom', 'rightTop'
  - width: defaults to 100px
  - height: default to 25px

###Debug.meter(percent, options)
updates the meter
adds a line to the end of the meter and scrolls the meter as necessary
* percent: between -1 to +1
* options {}
  - name: name of panel
  - panel: panel returned from Debug.Add()

###Debug.debug(text, options) or debug(text, options)
adds text to the end of a panel and scrolls the panel
* options {}
  - color: background color for text
  - name: name of panel
  - panel: panel returned from Debug.Add()

###Debug.debugOne(text, options) or debugOne(text, options)
replaces all text in the panel
* options {}
  - name: name of panel
  - panel: panel returned from Debug.Add()

###Debug.caller(options)
adds a debug message showing who called the function

## License
MIT License (MIT)