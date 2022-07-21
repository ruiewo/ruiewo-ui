const path = require('path');

module.exports = {
    mode: 'production',
    // mode: 'development', // production, development
    entry: {
        datePicker: `./src/components/datePicker/datePicker.ts`,
    },
    output: {
        path: path.join(__dirname, 'build'),
        filename: '[name].js',
        publicPath: '/',
        // assetModuleFilename: pathData => {
        //     const filepath = path.dirname(pathData.filename).split('/').slice(1).join('/');
        //     return `${filepath}/[name][ext]`;
        // },
        // assetModuleFilename: 'images/[name][ext]',
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
            },
            {
                test: /\.s[ac]ss$/i,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                            // url: false,
                        },
                    },
                    {
                        loader: 'sass-loader',
                    },
                ],
            },
            {
                test: /\.(ico|svg|jpe?g|png|webp)$/,
                type: 'asset/resource', // type: 'asset/inline',
            },
            {
                test: /\.html$/,
                type: 'asset/source',
            },
            {
                test: /\.json$/,
                type: 'asset/source',
            },
            {
                test: /\.csv$/,
                type: 'asset/source',
            },
        ],
    },
    resolve: {
        modules: [
            'node_modules', // node_modules 内も対象とする
        ],
        extensions: [
            '.ts',
            '.js', // node_modulesのライブラリ読み込みに必要
        ],
    },
};
