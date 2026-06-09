const http = require('http');

function makeRequest(path, data) {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 8080,
            path: path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body }));
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
}

async function run() {
    try {
        const username = 'testuser_' + Date.now();
        console.log(`Registering ${username}...`);
        const regRes = await makeRequest('/api/auth/register', JSON.stringify({username, password: 'password123'}));
        console.log('Register Response:', regRes);

        console.log(`Logging in ${username}...`);
        const loginRes = await makeRequest('/api/auth/login', JSON.stringify({username, password: 'password123'}));
        console.log('Login Response:', loginRes);
        
        console.log(`Logging in ${username} with UPPERCASE...`);
        const loginRes2 = await makeRequest('/api/auth/login', JSON.stringify({username: username.toUpperCase(), password: 'password123'}));
        console.log('Login Response 2:', loginRes2);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

run();
