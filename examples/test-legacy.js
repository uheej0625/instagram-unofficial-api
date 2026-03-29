'use strict';

const { IgApiClient, RealtimeClient } = require('../dist/index');

const username = process.env.IG_USERNAME;
const password = process.env.IG_PASSWORD;

async function testLegacy() {
    const ig = new IgApiClient();
    try {
        console.log('Logging in legacy...');
        await ig.account.login(username, password);
        console.log('Legacy login worked! Connecting to MQTT...');
        
        const realtime = new RealtimeClient(ig);
        realtime.on('connected', () => console.log('✅ Legacy MQTT Connected!'));
        realtime.on('error', err => console.error('❌ Legacy MQTT Error:', err.message));
        
        await realtime.connect({
            graphQlSubs: ['ig_sub_direct']
        });

        setTimeout(() => process.exit(0), 10000);
    } catch (err) {
        console.error('Legacy test failed:', err.message);
    }
}

testLegacy();
