const cp = require('child_process');
const cmd = cp.spawn('cmd.exe', ['/c', 'shopify theme push --theme "EcomLanders" --allow-live --only "sections/product-info-advanced.liquid" --only "assets/product-info-advanced.css" --only "assets/product-info-advanced.js"']);

cmd.stdout.on('data', d => {
    const str = d.toString();
    console.log(str);
    if (str.includes('Push theme files') || str.includes('Yes, confirm changes')) {
        cmd.stdin.write("\n");
    }
});
cmd.stderr.on('data', d => console.error('STDERR:', d.toString()));
cmd.on('close', c => console.log('exited with ' + c));
