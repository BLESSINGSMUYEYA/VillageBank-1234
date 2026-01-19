const net = require('net');
const tls = require('tls');
const url = require('url');

// Hardcoded for debugging based on .env
const connectionString = 'postgresql://neondb_owner:npg_2mSxszoh3MFl@ep-holy-field-ah68crgq-pooler.c-3.us-east-1.aws.neon.tech/Blessings?sslmode=require';

try {
    const parsed = new url.URL(connectionString);
    const port = 5432;
    const host = parsed.hostname;

    console.log(`Connecting to ${host}:${port}...`);

    const socket = net.createConnection(port, host, () => {
        console.log(`TCP connection established successfully to ${socket.remoteAddress}!`);
        socket.end();
    });

    socket.on('error', (err) => {
        console.error('TCP connection failed:', err);
    });

    // Also test TLS if possible
    const tlsSocket = tls.connect(port, host, { servername: host }, () => {
        console.log('TLS connection established successfully!');
        tlsSocket.end();
    });

    tlsSocket.on('error', (err) => {
        // TLS might fail if the server expects a startup packet first (Postgres protocol), 
        // but at least we can see if it connects.
        console.error('TLS connection warning/error:', err.message);
    });

} catch (e) {
    console.error('Error parsing URL:', e);
}
