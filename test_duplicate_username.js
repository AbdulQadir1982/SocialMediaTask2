const fetch = require('node-fetch');

const API_BASE_URL = 'http://localhost:5000/api';

const testDuplicateUsername = async () => {
    const unique_id = Date.now();
    const username = `duplicate_${unique_id}`;

    const user1 = {
        username: username,
        email: `email1_${unique_id}@example.com`,
        password: 'password123'
    };

    const user2 = {
        username: username, // Same username
        email: `email2_${unique_id}@example.com`, // Different email
        password: 'password123'
    };

    console.log('--- Registering User 1 ---');
    const res1 = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user1)
    });
    console.log('User 1 Status:', res1.status);
    const body1 = await res1.json();
    console.log('User 1 Msg:', body1);

    console.log('--- Registering User 2 (Duplicate Username) ---');
    const res2 = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user2)
    });
    console.log('User 2 Status:', res2.status);
    const body2 = await res2.json();
    console.log('User 2 Msg:', body2);

    if (res2.status === 400 && body2.msg === 'Username already taken') {
        console.log('SUCCESS: Duplicate username checked correctly.');
    } else {
        console.log('FAILURE: Did not catch duplicate username or wrong message.');
    }
};

testDuplicateUsername();
