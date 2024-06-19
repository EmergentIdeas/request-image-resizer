# Request Image Resizer

Written for the Webhandle framework, (although usable for any Express project),
this code watches for requests for images, determines if the
query requests that the image be resized, resizes the image if needed, and then
changes the express request to point to the resized image.


## Install

```bash
npm install @webhandle/request-image-resizer
```

## Usage

```js
import RequestImageResizer from "@webhandle/request-image-resizer"
import webhandle from 'webhandle'

let resizer = new RequestImageResizer({
	servingSink: webhandle.sinks.project
})

webhandle.routers.preStatic.use(resizer.getHandlerFunction())
```

To construct a URL which triggers the code, use something like this:

```URL
http://localhost:3000/img/4cats.jpg?webhandle-image-resizer&maxHeight=268px
```

or

```URL
http://localhost:3000/img/4cats.jpg?webhandle-image-resizer&maxWidth=268px
```

## Options

```js
	/**
	 * @param {object} [options] 
	 * @param {string} [options.queryTag] a string which must be in the query string of the URL to indicate that
	 * that this request should be processed.
	 * @param {FileSink} [options.servingSink] The FileSink which contains the images to be served/resized
	 * @param {string} [options.originPrefix] The path within the sink which is the root of the file servering tree ("public")
	 * @param {string} [options.cachePrefix] The path within the originPrefix directory where the resized images are put ("img-cache")
	 * @param {boolean} [options.generate] Set to false to keep images from being generated
	 */
```