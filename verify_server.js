const http = require('http');

function checkUrl(url) {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            console.log(`[${res.statusCode}] ${url}`);
            resolve(res.statusCode);
        }).on('error', (err) => {
            console.error(`Error fetching ${url}:`, err.message);
            resolve(null);
        });
    });
}

async function verify() {
    console.log('Verifying server...');

    // Check static files
    await checkUrl('http://localhost:5000/login.html');
    await checkUrl('http://localhost:5000/signup.html');
    await checkUrl('http://localhost:5000/app.js');

    console.log('Verification complete.');
}

verify();
