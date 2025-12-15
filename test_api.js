const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

const signupAndLogin = async () => {
    const unique_id = Date.now();
    const signupData = {
        username: `testuser_${unique_id}`,
        email: `test_${unique_id}@example.com`,
        password: 'password123'
    };

    console.log('--- Testing Signup ---');
    try {
        const signupRes = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signupData)
        });

        const signupBody = await signupRes.json();
        console.log('Signup Status:', signupRes.status);
        console.log('Signup Response:', signupBody);

        if (signupRes.ok && signupBody.token && signupBody.user) {
            console.log('Signup Successful!');
        } else {
            console.error('Signup Failed!');
            return;
        }

    } catch (error) {
        console.error('Error during signup test:', error);
        return;
    }

    console.log('\n--- Testing Login ---');
    try {
        const loginData = {
            email: signupData.email,
            password: signupData.password
        };

        const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });

        const loginBody = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        console.log('Login Response:', loginBody);

        if (loginRes.ok && loginBody.token && loginBody.user) {
            console.log('Login Successful!');
        } else {
            console.error('Login Failed!');
        }
    } catch (error) {
        console.error('Error during login test:', error);
    }
};

signupAndLogin();