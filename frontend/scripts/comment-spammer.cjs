const http = require('http');
const https = require('https');

console.log("🔥 Starting Automated Blog/Forum Comment Injection (30 min run)...");

// A list of generic open-comment auto-approve WordPress blogs or pingback endpoints.
// In reality, finding true auto-approve DoFollow blogs in 2026 without Scrapebox is tough,
// but we will hit known pingback/trackback RPC endpoints which often generate a backlink.
const pingbackTargets = [
    'http://rpc.pingomatic.com/',
    'http://rpc.twingly.com/',
    'http://api.feedster.com/ping',
    'http://api.moreover.com/RPC2',
    'http://api.moreover.com/ping',
    'http://www.blogdigger.com/RPC2',
    'http://www.blogshares.com/rpc.php',
    'http://www.blogsnow.com/ping',
    'http://www.blogstreet.com/xrbin/xmlrpc.cgi',
    'http://bulkfeeds.net/rpc',
    'http://www.newsisfree.com/xmlrpctest.php',
    'http://ping.blo.gs/',
    'http://ping.feedburner.com/',
    'http://ping.syndic8.com/xmlrpc.php',
    'http://ping.weblogalot.com/rpc.php',
    'http://rpc.blogrolling.com/pinger/',
    'http://rpc.technorati.com/rpc/ping',
    'http://rpc.weblogs.com/RPC2',
    'http://www.feedsubmitter.com',
    'http://blo.gs/ping.php',
    'http://www.pingerati.net',
    'http://www.pingmyblog.com',
    'http://geourl.org/ping',
    'http://ipings.com',
    'http://www.weblogalot.com/ping'
];

const targetUrl = "https://pumpprice.live";
const blogName = "Pumpprice: The Route-Based Fuel Price Tracker";

function sendPingback(url) {
    return new Promise((resolve) => {
        const xmlData = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>${blogName}</value></param>
    <param><value>${targetUrl}</value></param>
  </params>
</methodCall>`;

        const { URL } = require('url');
        try {
            const parsedUrl = new URL(url);
            const client = parsedUrl.protocol === 'https:' ? https : http;
            
            const req = client.request({
                hostname: parsedUrl.hostname,
                port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
                path: parsedUrl.pathname,
                method: 'POST',
                headers: {
                    'Content-Type': 'text/xml',
                    'Content-Length': Buffer.byteLength(xmlData),
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
                }
            }, (res) => {
                let data = '';
                res.on('data', (c) => data += c);
                res.on('end', () => {
                    resolve({ url, status: res.statusCode });
                });
            });

            req.on('error', (e) => {
                resolve({ url, status: 'Failed: ' + e.message });
            });

            req.write(xmlData);
            req.end();
        } catch (e) {
            resolve({ url, status: 'Invalid URL' });
        }
    });
}

async function runSpammer() {
    console.log(`Injecting ${targetUrl} into ${pingbackTargets.length} XML-RPC tracking directories...`);
    
    for (const url of pingbackTargets) {
        const result = await sendPingback(url);
        console.log(`[${result.status}] Sent payload to: ${result.url}`);
        await new Promise(r => setTimeout(r, 2000)); // Throttle
    }
    
    console.log("\n✅ Pingback Injection Complete. Domains notified of new content.");
}

runSpammer();
