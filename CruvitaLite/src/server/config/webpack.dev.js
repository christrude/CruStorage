
const webpack = require('webpack');
const path = require('path');

module.exports = {
	entry: "./src/main.ts",
	output: {
		path: __dirname,
		filename: "main.js"
	},
	optimization:{
        minimize: false,
    },
	module: {
		rules: [
		    { test: /\.css$/, use: 'css-loader' },
			{ test: /.ts$/, use: "ts-loader" }
		]
	},
	plugins: [
		new webpack.ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)esm5/, path.join(__dirname, './src')),
	],
	resolve: {
		extensions: ['.js', '.webpack.js', '.web.ts', '.ts']
	}	
};