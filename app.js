'use strict';

const Homey = require('homey');

class PollenApp extends Homey.App {
	
	async onInit() {
		this.log(`${Homey.manifest.id} V${Homey.manifest.version} is running...`);
	}
}

module.exports = PollenApp;