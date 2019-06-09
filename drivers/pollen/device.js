// Device.js
'use strict';

const Homey = require('homey');
const fetch = require('node-fetch');

const MINUTE = 60000;
//const MINUTE = 20000;

class PollenDev extends Homey.Device {

    async onInit() {
        this.log(`Init device ${this.getName()}`);
        
        this.pollenData=null;

		let data = this.getData();
		console.log(data);


        await this.setAvailable();

        // Get driver.
        this.driver = await this._getDriver();

        try {
            await this.fetchData()
            await this.setAvailable(); // We could update so the device is available.
        } catch (error) {
            this.log(error);
        }

        this.intervalid = setInterval(this.poll.bind(this), 30 * MINUTE);
    }

    // Get a (ready) instance of the driver.
    async _getDriver() {
        return new Promise(resolve => {
        let driver = this.getDriver();
        driver.ready(() => resolve(driver));
        });
    }

    
    async poll() {
        this.isSyncing = true;
        this.log('syncing');
        try {
          await this.fetchData()
          await this.setAvailable(); // We could update so the device is available.
        } catch(e) {
          this.log('error syncing', e);
          await this.setUnavailable(Homey.__('device.sync_error') + ': ' + e.message);
        }
        this.isSyncing = false;
        this.log("ready sync");
	}

    async fetchData(){
        let key = 'b7401295888443538a7ebe04719c8394';
        let url = `https://api.breezometer.com/pollen/v2/forecast/daily/?key=${key}&lat=${this.driver.latitude}&lon=${this.driver.longitude}&features=plants_information,types_information&days=3&metadata=true`;
		this.log(`Get ${url}`);
		const res = await fetch(url);
        if (res.ok) 
        {   
            const data = await res.json(); 
            let lastSeen = this.toLocalTime(new Date()).toISOString().replace('T', ' ').substr(0, 19)
            this.setCapabilityValue("lastSeen", lastSeen).catch(e => {
                this.log(`Unable to set lastSeen: ${ e.message }`);
            });

            try {
                let gi = this.get(data.data[0],'types.grass.index.value');
                let li = this.get(data.data[0],'types.tree.index.value');
                let wi = this.get(data.data[0],'types.weed.index.value');

                if (gi == null) {gi=0};
                if (li == null) {li=0};
                if (wi == null) {wi=0};


                //triggers
                if (this.getCapabilityValue('grass') !== gi) { this.driver._triggers.trgGrassChanged.trigger(this, { measure_grass_index: gi }); }
                if (this.getCapabilityValue('tree') !== li)  { this.driver._triggers.trgTreeChanged.trigger(this,  { measure_tree_index: li }); }
                if (this.getCapabilityValue('weed') !== wi)  { this.driver._triggers.trgWeedChanged.trigger(this,  { measure_weed_index: wi }); }
                

                this.setCapabilityValue("grass",gi).catch(e => {
                    this.log(`Unable to set grass: ${ e.message }`);
                });   
                this.setCapabilityValue("tree",li).catch(e => {
                        this.log(`Unable to set tree: ${ e.message }`);
                });
                this.setCapabilityValue("weed",wi).catch(e => {
                        this.log(`Unable to set weed: ${ e.message }`);
                });

                let mgi = this.get(data.data[1],'types.grass.index.value');
                let mli = this.get(data.data[1],'types.tree.index.value');
                let mwi = this.get(data.data[1],'types.weed.index.value');

                if (mgi == null) {mgi=0};
                if (mli == null) {mli=0};
                if (mwi == null) {mwi=0};

                this.setCapabilityValue("mgrass",mgi).catch(e => {
                    this.log(`Unable to set mgrass: ${ e.message }`);
                });   
                this.setCapabilityValue("mtree",mli).catch(e => {
                        this.log(`Unable to set mtree: ${ e.message }`);
                });
                this.setCapabilityValue("mweed",mwi).catch(e => {
                        this.log(`Unable to set mweed: ${ e.message }`);
                });








            } catch (error) {
                this.error(error);
            }
        }
        else 
        {
            this.error('Unknown Error');
        
        } 
    }

    get(obj, key) {
        return key.split(".").reduce(function(o, x) {
            return (typeof o == "undefined" || o === null) ? o : o[x];
        }, obj);
    }

    toLocalTime(time){
        var offset = new Date().getTimezoneOffset() * 60 * 1000 * -1;
        var n = new Date(time.getTime() + offset);
        return n;
     }


    onSettings( oldSettingsObj, newSettingsObj, changedKeysArr, callback ) {
        callback( null, true );
    }

    onAdded() {
        this.log(`New device added: ${this.getName()} - ${this.getData().ip} `);
    }

    onDeleted() {
        clearInterval(this.intervalid);
        this.log('device deleted');
    }

}

module.exports = PollenDev;
