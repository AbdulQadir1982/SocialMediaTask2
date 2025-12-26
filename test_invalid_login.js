const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

const testInvalidLogin = async () => {
    // 1. Test Login with Non-Existent User
    console.log('--- Test 1: Login with invalid email ---');
    const invalidEmailRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'doesntexist@example.com', password: 'password123' })
    });
    const body1 = await invalidEmailRes.json();
    console.log('Status:', invalidEmailRes.status);
    console.log('Body:', body1);

    if (invalidEmailRes.status === 400 && body1.msg === 'Invalid Credentials') {
        console.log('SUCCESS: Handled non-existent user correctly.');
    } else {
        console.log('FAILURE: Failed to handle non-existent user.');
    }

    // 2. Signup Valid User
    const unique_id = Date.now();
    const user = {
        username: `valid_user_${unique_id}`,
        email: `valid_${unique_id}@example.com`,
        password: 'password123'
    };

    await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user)
    });

    // 3. Test Login with Wrong Password
    console.log('\n--- Test 2: Login with wrong password ---');
    const wrongPassRes = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: 'wrongpassword' })
    });
    const body2 = await wrongPassRes.json();
    console.log('Status:', wrongPassRes.status);
    console.log('Body:', body2);

    if (wrongPassRes.status === 400 && body2.msg === 'Invalid Credentials') {
        console.log('SUCCESS: Handled wrong password correctly.');
    } else {
        console.log('FAILURE: Failed to handle wrong password.');
    }
};

testInvalidLogin();
