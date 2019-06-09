'use strict';

const Homey = require('homey');
const MINUTE = 60000;

class PollenDriver extends Homey.Driver {

    async onInit() { 
        this.log('Init driver');

        this.latitude = Homey.ManagerGeolocation.getLatitude();
		this.longitude = Homey.ManagerGeolocation.getLongitude();

        Homey.ManagerGeolocation.on('location', (loc) => {
            this.latitude = loc.latitude;
            this.longitude = loc.longitude;
        });

        this.registerFlowCards();
    }

    onPairListDevices(data, callback) {
		let devices = [
			{ "name": "Pollen",
			  "data": {"id": uuidv4()},
			  "settings": {
			  }
			}
		];
		callback(null, devices);
	};

    registerFlowCards() {

        this._triggers = {
			trgGrassChanged: new Homey.FlowCardTriggerDevice('grassChange').register(),
			trgTreeChanged:  new Homey.FlowCardTriggerDevice('treeChange').register(),
			trgWeedChanged:  new Homey.FlowCardTriggerDevice('weedChange').register(),
		};

		this._conditions = {
			cndGrassAbove: new Homey.FlowCardCondition('measure_grass_index').register().registerRunListener((args, state) => {
                 return Promise.resolve((this.getCapabilityValue('grass') > args.index));
			}),
			cndTreeAbove: new Homey.FlowCardCondition('measure_tree_index').register().registerRunListener((args, state) => {
                 return Promise.resolve((this.getCapabilityValue('tree') > args.index));
			}),
			cndWeedAbove: new Homey.FlowCardCondition('measure_weed_index').register().registerRunListener((args, state) => {
                 return Promise.resolve((this.getCapabilityValue('weed') > args.index));
            }),
		};
    }
}

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}


module.exports = PollenDriver;