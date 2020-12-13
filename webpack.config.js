const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const LwcWebpackPlugin = require('lwc-webpack-plugin');
const path = require('path');
const fs = require('fs');

const config = {
    entry: {
        fallback: './src/client/index.js',
        dataTools: './src/client/dataTools.js',
        platformeventapp: './src/client/platformeventapp.js',
        platformeventactivity: './src/client/platformeventactivity.js'
    },
    mode: 'production',
    output: {
        path: path.resolve('dist'),
        filename: './[name].js'
    },
    plugins: [
        new CleanWebpackPlugin(),
        new LwcWebpackPlugin({
            modules: [
                { dir: 'src/client/modules' },
                { npm: 'lightning-base-components' }
            ]
        }),
        new HtmlWebpackPlugin({
            template: 'src/client/index.html',
            filename: './index.html',
            title: 'fallback',
            chunks: ['fallback']
        }),
        new HtmlWebpackPlugin({
            template: 'src/client/index.html',
            filename: './dataTools/index.html',
            title: 'Data Tools',
            chunks: ['dataTools']
        }),

        new HtmlWebpackPlugin({
            template: 'src/client/index.html',
            filename: './platformeventapp/index.html',
            title: 'Platform Event Config',
            chunks: ['platformeventapp']
        }),
        new HtmlWebpackPlugin({
            template: 'src/client/index.html',
            filename: './platformeventactivity/index.html',
            title: 'Platform Event Activity',
            chunks: ['platformeventactivity']
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: 'src/client/assets',
                    to: 'assets/'
                },
                {
                    from:
                        'node_modules/@salesforce-ux/design-system/assets/images',
                    to: 'assets/images'
                },
                {
                    from:
                        'node_modules/@salesforce-ux/design-system/assets/icons',
                    to: 'assets/icons'
                },
                {
                    from:
                        'node_modules/@salesforce-ux/design-system/assets/fonts',
                    to: 'assets/fonts'
                },
                {
                    from:
                        'node_modules/@salesforce-ux/design-system/assets/styles/salesforce-lightning-design-system.min.css',
                    to:
                        'assets/styles/salesforce-lightning-design-system.min.css'
                }
            ]
        })
    ],
    stats: { assets: false }
};

// development only
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
    config.mode = 'development';
    config.devtool = 'source-map';
    config.devServer = {
        contentBase: path.resolve(__dirname, 'dist'),
        compress: true,
        port: process.env.CLIENT_PORT,
        stats: 'errors-only', //confirm if correct to stop full list
        proxy: {
            '/': {
                target: `https://${process.env.HOST}:${process.env.PORT}/`,
                secure: false
            }
        },
        https: true,
        key: fs.readFileSync(
            path.join(__dirname, 'certificates', 'private.key'),
            'ascii'
        ),
        cert: fs.readFileSync(
            path.join(__dirname, 'certificates', 'private.crt'),
            'ascii'
        ),
        ca: fs.readFileSync(
            path.join(__dirname, 'certificates', 'private.pem'),
            'ascii'
        )
    };
}

module.exports = config;
