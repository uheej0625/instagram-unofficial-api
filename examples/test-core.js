'use strict';

const IgApiClient = require('../src/core/IgApiClient');

async function testCoreArchitecture() {
    console.log('🚀 Initializing Modern IgApiClient...');
    const ig = new IgApiClient();

    console.log('\n--- 1. State & Device Simulation ---');
    console.log('Android Device ID:', ig.state.device.deviceId);
    console.log('Hardware String:', ig.state.device.deviceString);
    console.log('Generated App User-Agent:', ig.request._getUserAgent());
    console.log('Initial Cookies Count:', ig.state.cookieJar.getCookiesSync('https://i.instagram.com').length);

    console.log('\n--- 2. HTTP Request Wrapper & Interceptors ---');
    console.log('Sending initial GET request to Instagram to capture CSRF token...');
    
    try {
        const response = await ig.request.send({
            method: 'GET',
            // Using Web URL to easily capture pre-login CSRF token
            url: 'https://www.instagram.com/accounts/login/' 
        });

        console.log(`Response Status: ${response.status}`);
        
        const cookies = ig.state.cookieJar.getCookiesSync('https://www.instagram.com');
        console.log(`Cookies Saved Automatically by Interceptor: ${cookies.map(c => c.key).join(', ')}`);
        
        // Let's see if the state manager successfully routes the getter
        console.log(`Global CSRF Token Shortcut Output:`, ig.state.csrfToken);
        
        if (ig.state.csrfToken) {
            console.log('\n✅ 테스트 성공! State Manager와 Request Manager가 완벽하게 연동되어 패킷 헤더와 쿠키를 관리하고 있습니다.');
        } else {
            console.log('\n⚠️ 테스트 주의: 인스타그램 서버에서 CSRF 쿠키를 주지 않았습니다. (일시적 IP 블락 등)');
        }
        
    } catch (error) {
        console.error('\n❌ HTTP 테스트 실패:', error.message);
    }
}

testCoreArchitecture();
