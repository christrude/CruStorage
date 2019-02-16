const webpack = require('webpack');
const helpers = require('./helpers');
const merge = require('webpack-merge');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { BaseHrefWebpackPlugin } = require('base-href-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ConcatPlugin = require('webpack-concat-plugin');
const ngInventory = require('./ng1-vendor-index.js');

const common = require('./webpack.common.js');

const ENV = process.env.NODE_ENV = process.env.ENV = 'dev';

module.exports = merge(common(ENV), {
	devtool: 'source-map',

	module: {
		rules: [
			{
				test: /\.(js)$/,
				loaders: ['angular-router-loader'],
			},
			{
				test: /\.((s*)css)$/,
				use: [{
					loader: 'style-loader',
				},{
					loader: 'css-loader',
				},{
					loader: 'sass-loader',
				}]
			},
			{
				test: /src\/.+\.(js)$/,
				loader: 'istanbul-instrumenter-loader',
				enforce: 'post',
				options: {
					esModules: true
				}
			}
		]
	},
	plugins: [
		new ConcatPlugin({
			uglify: false,
			sourceMap: true,
			name: 'vendor',
			outputPath: './',
			fileName: '[name].[hash].js',
			filesToConcat: ngInventory.vendor1
		}),
	    
		new BaseHrefWebpackPlugin({ baseHref: '/'}),
		
		new HtmlWebpackPlugin({
	      	template: "./client/index.html",
	      	filename: "./client/index.html",
	    }),

		new webpack.NoEmitOnErrorsPlugin(),
	],
});