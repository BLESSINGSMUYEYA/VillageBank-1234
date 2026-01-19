const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['info', 'warn', 'error'],
});

async function testNet() {
    try {
        const dbUrl = process.env.DATABASE_URL;
        if (!dbUrl) {
            console.log('No DATABASE_URL found');
            return false;
        }
        const { hostname, port } = new URL(dbUrl);
        const p = port || 5432;

        console.log(`\n--- Network Diagnostics ---`);
        console.log(`Database Host: ${hostname}`);
        console.log(`Database Port: ${p}`);
        console.log(`Process ENV Proxies: HTTP_PROXY=${process.env.HTTP_PROXY || 'N/A'}, HTTPS_PROXY=${process.env.HTTPS_PROXY || 'N/A'}, ALL_PROXY=${process.env.ALL_PROXY || 'N/A'}`);

        // 0. DNS Lookup
        console.log(`\n0. DNS Lookup...`);
        const dns = require('dns').promises;
        try {
            const addresses = await dns.lookup(hostname, { all: true });
            console.log('Resolved addresses:', JSON.stringify(addresses));
        } catch (e) {
            console.error('DNS Lookup failed:', e);
        }

        // 1. Test Raw TCP
        console.log(`\n1. Testing raw TCP connection...`);
        await new Promise((resolve) => {
            const socket = require('net').createConnection(p, hostname, () => {
                console.log('✅ Raw TCP connection successful');
                socket.end();
                resolve();
            });
            socket.on('error', (err) => {
                console.error('❌ Raw TCP connection failed:', err.message);
                resolve();
            });
            socket.setTimeout(5000, () => {
                console.error('❌ Raw TCP connection timed out');
                socket.destroy();
                resolve();
            });
        });

        // 1.5 Test Raw TCP to IP (Direct)
        const directIp = '23.21.74.185';
        console.log(`\n1.5. Testing raw TCP to IP (${directIp})...`);
        await new Promise((resolve) => {
            const socket = require('net').createConnection(p, directIp, () => {
                console.log('✅ Raw TCP (IP) connection successful');
                socket.end();
                resolve();
            });
            socket.on('error', (err) => {
                console.error('❌ Raw TCP (IP) connection failed:', err.message);
                resolve();
            });
            socket.setTimeout(5000, () => {
                console.error('❌ Raw TCP (IP) connection timed out');
                socket.destroy();
                resolve();
            });
        });

        // 2. Test TLS
        console.log(`\n2. Testing TLS connection...`);
        await new Promise((resolve) => {
            const socket = require('tls').connect(p, hostname, { servername: hostname }, () => {
                console.log('✅ TLS connection successful');
                socket.end();
                resolve();
            });
            socket.on('error', (err) => {
                console.error('❌ TLS connection failed:', err.message);
                // Common causing of TLS failure is self-signed certs or missing roots, but Neon uses well-known CAs usually.
                if (err.code === 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY') {
                    console.error('   Hint: This might be due to missing root certificates or corporate proxy.');
                }
                resolve();
            });
            socket.setTimeout(8000, () => {
                console.error('❌ TLS connection timed out');
                socket.destroy();
                resolve();
            });
        });
        console.log(`--- End Network Diagnostics ---\n`);

    } catch (e) {
        console.error('Diagnostic error:', e);
    }
}

async function main() {
    await testNet();

    console.log('Testing Prisma connection...');
    console.log('URL provided:', process.env.DATABASE_URL ? 'Yes (hidden)' : 'No');

    try {
        await prisma.$connect();
        console.log('Successfully connected to the database.');

        const userCount = await prisma.user.count();
        console.log(`Connection verified. User count: ${userCount}`);

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
