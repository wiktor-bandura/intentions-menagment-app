const { resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function(env) {
    var prod = env !== undefined && env.production === true;
    var dev = env !== undefined && env.development === true;

    return {
        mode: 'development',
        entry: {
            index: './src/js/index.js',
            login: './src/js/login.js'
        },
        output: {
            publicPath: dev ? '/dist/':'',
            path: resolve(__dirname, 'dist/'),
            filename: prod ? '[name].[chunkhash].js' : '[name].js'
        },
        devtool: prod ? 'source-map' : 'cheap-module-eval-source-map',

        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['env'],
                        }
                    }
                },
                {
                    test: /\.scss$/,
                    use: [MiniCssExtractPlugin.loader, 'css-loader', 'sass-loader']
                },
                {
                    test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
                    use: {
                        loader: 'url-loader',
                        options: {
                            limit: false,
                            name: "[name].[ext]"
                        }
                    }
                }
            ]
        },
        plugins: [
            new MiniCssExtractPlugin('style.css'),
            new HtmlWebpackPlugin({
                template: './src/index.html',
            })
        ]
    }
}