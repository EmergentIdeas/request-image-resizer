
import path from "path"
import express from "express"
import filog from "filter-log"
import loadTemplates from "./add-templates.js"
import webhandle from "webhandle"
import RequestImageResizer from "../server-lib/request-image-resizer.mjs"

let log

export default function(app) {
	log = filog('unknown')

	// add a couple javascript based tripartite templates. More a placeholder
	// for project specific templates than it is a useful library.
	loadTemplates()
	
	webhandle.routers.preStatic.get(/.*\.cjs$/, (req, res, next) => {
		console.log('cjs')
		res.set('Content-Type', "application/javascript")
		next()
	})
	
	
	let resizer = new RequestImageResizer({
		servingSink: webhandle.sinks.project
	})

	webhandle.routers.preStatic.use(resizer.getHandlerFunction())


}

