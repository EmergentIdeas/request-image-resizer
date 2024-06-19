
import PathTools from 'path';

import numberize from './numberize.mjs'
import { createConvertCommandArguments, generateImage, waitCommand } from './generation.mjs'

let defaultQueryTag = 'webhandle-image-resizer'

export default class RequestImageResizer {
	
	/**
	 * @param {object} [options] 
	 * @param {string} [options.queryTag] a string which must be in the query string of the URL to indicate that
	 * that this request should be processed.
	 * @param {FileSink} [options.servingSink] The FileSink which contains the images to be served/resized
	 * @param {string} [options.originPrefix] The path within the sink which is the root of the file servering tree ("public")
	 * @param {string} [options.cachePrefix] The path within the originPrefix directory where the resized images are put ("img-cache")
	 * @param {boolean} [options.generate] Set to false to keep images from being generated
	 */
	constructor(options = {}) {
		
		this.queryTag = options.queryTag || defaultQueryTag
		this.servingSink = options.servingSink
		this.originPrefix = options.originPrefix || 'public'
		this.cachePrefix = options.cachePrefix || 'img-cache'
		this.generate = options.generate || true
	}
	
	createConvertCommandArguments = createConvertCommandArguments
	generateImage = generateImage
	waitCommand = waitCommand
	numberize = numberize
	
	getOriginPath(req) {
		let path = this.getReqPath(req)
		let filePath = PathTools.join(this.originPrefix, path)
		return filePath
	}
	
	getReqPath(req) {
		let path = req.baseUrl + req.path
		path = decodeURIComponent(path)
		return path
	}
	
	resizeParameter(req, params, name) {
		if(name in req.query) {
			let val = req.query[name]
			val = this.numberize(val)
			params[name] = val
		}
	}

	getResizeParameters(req) {
		let params = {}
		this.resizeParameter(req, params, 'maxWidth')
		this.resizeParameter(req, params, 'maxHeight')
		
		return params
	}
	
	splitParts(path) {
		let i = path.lastIndexOf('.')
		return [ path.substring(0, i), path.substring(i)]
	}

	getCacheServingPath(req, resizeParms) {
		let path = this.getReqPath(req)
		path = PathTools.join(this.cachePrefix, path)
		let [start, end] = this.splitParts(path)

		if(resizeParms.maxWidth) {
			start += '-' + resizeParms.maxWidth + 'w'
		}
		if(resizeParms.maxHeight) {
			start += '-' + resizeParms.maxHeight + 'h'
		}

		return start + end
	}

	getCachePath(req, resizeParms) {
		let path = this.getCacheServingPath(req, resizeParms)
		path = PathTools.join(this.originPrefix, path)
		return path
	}
	
	addSinkPrefix(path) {
		return PathTools.join(this.servingSink.path, path)
	}
	
	isResizerQuery(req, res) {
		return this.queryTag in req.query
	}
	
	getHandlerFunction() {
		return async (req, res, next) => {
			// by default, we'll be looking for webhandle-image-resizer as part of the query string
			if(this.isResizerQuery(req, res)) {
				try {
					let originPath = this.getOriginPath(req)
					await this.servingSink.getFullFileInfo(originPath)

					let resizeParms = this.getResizeParameters(req)
					let cachePath = this.getCachePath(req, resizeParms)
					
					let resizedFile

					try {
						resizedFile = await this.servingSink.getFullFileInfo(cachePath)
						// The cached item already exists
					}
					catch(e) {
						// we need to run the convertion
						if(this.generate) {
							resizedFile = await this.generateImage(originPath, cachePath, resizeParms)
						}
					}

					if(resizedFile) {
						req.url = '/' + this.getCacheServingPath(req, resizeParms)
					}
				}
				catch(e) {
					// probably no image exists. This isn't really an error for this code.
				}
			}
			return next()
		}
	}
}
