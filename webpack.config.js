const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    mode: 'development',
    entry: {
        bundle: path.resolve(__dirname, 'src/index.js'),
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name][contenthash].js',
        clean: true,
        assetModuleFilename: '[name][ext]',
    },
    devtool: 'source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist'),
        },
        port: 3000,
        open: true,
        hot: true,
        compress: true,
        historyApiFallback: true,
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: ['style-loader', 'css-loader', 'sass-loader'],
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                    },
                },
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            }
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Mini Hacker News',
            filename: 'index.html',
            template: 'src/template.html',
            meta: {
                'og:title': { property: 'og:title', content: 'Mini Hacker News' },
                'og:type': { property: 'og:type', content: 'website' },
                'og:url': { property: 'og:url', content: 'https://jsadvanced-start2impact.firebaseapp.com/' },
                'og:image': { property: 'og:image', content: 'https://m.media-amazon.com/images/I/31yVXthEjbL.png' },
                'og:description': { property: 'og:description', content: 'Hi! This is a little JS project for start2impact Javascript Advanced course!' },
                'twitter:card': { property: 'twitter:card', content: 'summary_large_image' },
                'twitter:url': { property: 'twitter:url', content: 'https://jsadvanced-start2impact.firebaseapp.com/' },
                'twitter:title': { property: 'twitter:title', content: 'Mini Hacker News' },
                'twitter:description': { property: 'twitter:description', content: 'Hi! This is a little JS project for start2impact Javascript Advanced course!' },
                'twitter:image': { property: 'twitter:image', content: 'https://m.media-amazon.com/images/I/31yVXthEjbL.png' },
            }
        }),
        new FaviconsWebpackPlugin({
            logo: './src/assets/img/favicons/android-chrome-512x512.png',
            mode: 'auto',
            devMode: 'webapp',
        }),
        new BundleAnalyzerPlugin(),
    ],
}
