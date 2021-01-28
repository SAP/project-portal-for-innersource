"use strict";

const fs = require("fs-extra");

// declare all dependencies
const sLibraryPath = "./lib/";
const oLibraries = {
	"handlebars": [
		"./node_modules/handlebars/dist/handlebars.js",
		"./node_modules/handlebars/dist/handlebars.runtime.js",
	],
	"materialize-css": [
		"./node_modules/materialize-css/dist/css/materialize.min.css",
		"./node_modules/materialize-css/dist/js/materialize.min.js"
	],
	"material-icons": [
		"./node_modules/material-icons/iconfont/material-icons.css",
		"./node_modules/material-icons/iconfont/MaterialIcons-Regular.ttf",
		"./node_modules/material-icons/iconfont/MaterialIcons-Regular.woff",
		"./node_modules/material-icons/iconfont/MaterialIcons-Regular.woff2",
		"./node_modules/material-icons/iconfont/MaterialIcons-Regular.eot",
		"./node_modules/material-icons/iconfont/MaterialIcons-Regular.svg"
	],
	"moment": [
		"./node_modules/moment/min/moment.min.js"
	],
	"seedrandom": [
		"./node_modules/seedrandom/seedrandom.min.js"
	]
};

// copy minified libraries from node_modules to lib folder
Object.keys(oLibraries).forEach(sLibrary => {
	console.log("copying dependencies for library " + sLibrary + "...");
	oLibraries[sLibrary].forEach(sPath => {
		const sTargetPath = sLibraryPath + sPath.split("/").pop();
		fs.copyFile(sPath, sTargetPath);
		console.log("copying " + sPath + " to " + sTargetPath);
	});
});


