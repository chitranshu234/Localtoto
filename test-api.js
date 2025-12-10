// Run this file with: node test-api.js

async function testSendOtp() {
    const url = 'https://django-backend-production-43a6.up.railway.app/api/users/send-otp';
    const body = {
        phoneNumber: '9999999999' // Test number
    };

    console.log('Testing API:', url);
    console.log('Sending Body:', body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        console.log('Response Status:', response.status);
        console.log('Response Data:', data);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testSendOtp();
