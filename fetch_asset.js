const https = require('https');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const themeId = '186679689538';
const assetKey = 'templates/product.json';
const shop = 'ecomlanderstest.myshopify.com';

rl.question('Please enter your Shopify Admin API Access Token (shpat_...): ', (token) => {
    rl.close();

    const options = {
        hostname: shop,
        path: `/admin/api/2024-01/themes/${themeId}/assets.json?asset[key]=${assetKey}`,
        method: 'GET',
        headers: {
            'X-Shopify-Access-Token': token.trim(),
            'Content-Type': 'application/json'
        }
    };

    const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (d) => { data += d; });

        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.asset && parsed.asset.value) {
                    console.log("Successfully fetched current state. Looking for older versions requires GraphQL or manual reconstruction.");
                    console.log("Saving current state to current_product_test.json");
                    fs.writeFileSync('current_product_test.json', parsed.asset.value);
                } else {
                    console.log(parsed);
                }
            } catch (e) { console.error(e); }
        });
    });

    req.on('error', (e) => {
        console.error(e);
    });
    req.end();
});
