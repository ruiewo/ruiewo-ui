const { argv } = require('process');
const { build } = require('esbuild');
const path = require('path');

const options = {
    // define: { 'process.env.NODE_ENV': process.env.NODE_ENV },
    entryPoints: ['./src/index.ts', './src/components/datePicker/datePicker'],
    minify: false,
    bundle: false,
    target: 'esnext',
    platform: 'browser',
    outdir: './build',
    // tsconfig: 'tsconfig.json',
    loader: {
        '.html': 'text',
        '.css': 'text',
    },
};

//     "build": "esbuild src/index.js --bundle --outfile=dist/index.js --loader:.html=text"

build(options).catch(err => {
    process.stderr.write(err.stderr);
    process.exit(1);
});
