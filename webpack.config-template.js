const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
var ImageminPlugin = require('imagemin-webpack-plugin').default
const CleanWebpackPlugin = require('clean-webpack-plugin');




module.exports = function(env) {
	
	return({
	
    entry: {
				main: ["./src/js/importStaticData.js",
							"./src/js/bootstrap.min.js",
							"./src/js/owl.carousel.min.js",
							"./src/js/jquery.magnific-popup.min.js",
							"./src/js/parallax.min.js",
							"./src/js/scrolla.jquery.min.js",
							"./src/js/jquery.waypoints.min.js",
							"./src/js/main.js",
							"./src/js/slick.min.js",
							"./src/js/particles.js",
							"./src/js/jquery.fancybox.min.js",
							"./src/js/jquery.countTo.js"
						]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: 'bundle.min.js'
    },
	
	watch: true,
	
	devtool: env === 'production' ? 'source-map' : 'cheap-eval-source-map',
	
    module: {
		
		rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
 
		  
		  {
				test: /\.(png|jpg|gif|svg|eot|ttf|woff|woff2)$/,
				loader: 'url-loader',
				options: {
					limit: 10000
				}
			},

			{
        test: /\.(pdf)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
							name: '[path][name].[ext]'
						}  
          }
        ]
      },
		  /*
		  {
		    test: /\.(s*)css$/,
		    use: ExtractTextPlugin.extract({
					fallback:'style-loader',
					use:['css-loader'],
		   })
			}
			*/
		],
		
    loaders: [
			{
				test: [/\.js$/, /\.es6$/],
				exclude: /(node_modules|bower_components)/,
				use: [
          {
            loader: 'babel-loader',
            options: {
              presets: ['es2015','es2016','react','env'],
            },
          },
        ]
			},
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'jshint-loader'
			}
		]
	},
	resolve: {
		extensions: ['.js', '.es6']
	},
	
	devServer:{
            contentBase: path.join(__dirname, "dist"),
            compress: true,
            port: 9000,
            stats:'errors-only',
    },
	
	plugins: [
			new UglifyJSPlugin({
				test: /\.js($|\?)/i,
				sourceMap: true,
				uglifyOptions: {
						compress: true
				}
			}),
			    
			

			
			new ExtractTextPlugin("styles.css"),
			
		new ImageminPlugin({
		      disable: process.env.NODE_ENV !== 'production',
		      test: /\.(jpe?g|png|gif|svg)$/i,
		optipng: {
			optimizationLevel: 1
		      }
		    }),
			new HtmlWebpackPlugin({
			template: path.join(__dirname, 'public', 'index.html'),
			}),
			new webpack.ProvidePlugin({
				'window.jQuery'    : 'jquery',
				'window.$'         : 'jquery',
				'jQuery'           : 'jquery',
				'$'                : 'jquery'
			})
			/*new CleanWebpackPlugin(['dist'])*/
			]
	})

};
