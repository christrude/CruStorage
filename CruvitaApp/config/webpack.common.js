const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals')
const helpers = require('./helpers');

module.exports = env => ({
	entry: {
		server: './server/app.js',
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	output: {
		path: helpers.root(`dist/${env}`),
	    publicPath: '/',
	    filename: '[name].js'
  	},
  	target: 'node',
	node: {
	    // Need this when working with express, otherwise the build fails
	    __dirname: false,   // if you don't put this is, __dirname
	    __filename: false,  // and __filename return blank or /
  	},
  	externals: [nodeExternals()],

	module: {
		rules: [
		 	{
			// Transpiles ES6-8 into ES5
				test: /\.js$/,
				exclude: /(node_modules)/,
				use: {
				    loader: "babel-loader",
					options: {
					  	presets: ['@babel/preset-env']
					}
				}
			},
			{
				test: /\.html$/,
				include: [
					helpers.root('client'),
				],
				loader: 'html-loader'
			},

			{
				test: /\.((s*)css)%/,
				include: [
					helpers.root('client/app'),
					helpers.root('client/components'),
				],
				loaders: ['to-string-loader', 'css-loader', 'sass-loader']
			},

			{
				test: /\.(woff|woff2|eot|tts)$/,
				use: [{
					loader: 'file-loader'
				}]
			}
		]
	},

	plugins: [

		new webpack.DefinePlugin({
			'process.env': {
				'ENV': JSON.stringify(env)
			}
		}),

		new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/, path.join(__dirname, './client')),
	]
});