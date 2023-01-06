const fs = require("fs");
const path = require("path");
const { JSDOM } = require("jsdom");
const indexHtml = fs.readFileSync(
	path.join(__dirname, "../../index.html"),
	"utf8"
);
const window = new JSDOM(indexHtml).window;
const document = window.document;
global.document = document;
global.window = window;
global.window.alert = (message) => {
	//suppress alert during tests
};
module.exports = document;
