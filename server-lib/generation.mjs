import PathTools from 'path';
import { spawn } from 'child_process'
import filog from 'filter-log'
let log = filog('@webhandle/request-image-resizer')

export function createConvertCommandArguments(originPath, cachePath, resizeParms) {
	return ["-quality", "70", "-resize", `${resizeParms.maxWidth || ''}x${resizeParms.maxHeight || ''}`, `${originPath}`, `${cachePath}`]
}

export async function waitCommand(cmd) {
	let data = ''
	return new Promise((resolve, reject) => {
		cmd.on('data', (chunk) => {
			data += chunk
		})
		cmd.on('close', () => {
			resolve(data)
		})
	})
}

/**
 * Generate a resized image. Return the file if successful 
 * @param {*} originPath 
 * @param {*} cachePath 
 * @param {*} resizeParms 
 */
export async function generateImage(originPath, cachePath, resizeParms) {
	let args = this.createConvertCommandArguments(originPath, cachePath, resizeParms)
	this.servingSink.mkdir(PathTools.dirname(cachePath), {
		recursive: true
	})
	let cmd = spawn('/usr/bin/convert', args)

	const output = await this.waitCommand(cmd)
	if (output) {
		log.error({
			msg: 'Could not convert file'
			, arguments: args
			, output: output
		})
	}

	try {
		// check it again to make sure the file got created
		// We can NOT just check stderr because sometimes imagemagick is a bit chatty
		// with its warning messages. Since we don't necessarily have control of the images,
		// we want to be pretty error tollerant.
		return await this.servingSink.getFullFileInfo(cachePath)
	}
	catch (e) {
		// Image conversion failed for some reason
		log.error({
			msg: 'Image conversion failed'
			, error: e
		})
	}
}