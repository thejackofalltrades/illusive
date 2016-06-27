/**
 *
 * Webpack Config
 * Handles configuration of the Webpack CLI.
 *
 */
var webpack = require( "webpack" );
var fs = require( "fs");
var path = require( "path" );
var autoprefixer = require( "autoprefixer" );
var cssnano = require( "cssnano" );
var WebpackOnBuildPlugin = require( "on-build-webpack" );

var sassLoaders = [
    "file-loader?name=../css/[name].css",
    "postcss-loader",
    "sass-loader?sourceMap"
];


/**
 *
 * dev
 * Webpack config for development build.
 * Compiles JavaScript & Sass.
 * Minifies CSS automatically after build.
 *
 */
dev = {
    devtool: "source-map",


    resolve: {
        root: path.resolve( __dirname ),
        packageMains: [
            "webpack",
            "browserify",
            "web",
            "hobo",
            "main"
        ]
    },


    entry: {
        "app": path.resolve( __dirname, "source/js/app.js" )
    },


    output: {
        path: path.resolve( __dirname, "template/assets/js" ),
        filename: "[name].js"
    },


    module: {
        preLoaders: [
            // ESLint
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules/,
                loader: "eslint-loader"
            }
        ],


        loaders: [
            // Babel
            {
                test: /source\/js\/.*\.js$/,
                exclude: /node_modules/,
                loader: "babel",
                query: {
                    presets: [
                        "es2015"
                    ]
                }
            },

            // Expose ProperJS hobo
            {
                test: /(hobo|hobo.build)\.js$/,
                loader: "expose?hobo"
            },

            // Expose jQuery
            // {
            //     test: /jquery\/dist.*\.js$/,
            //     loader: "expose?$!expose?jQuery"
            // },

            // Sass
            {
                test: /\.scss$/,
                loader: sassLoaders.join( "!" )
            }
        ]
    },


    postcss: [
        autoprefixer({
            browsers: [
                "last 2 versions"
            ]
        })
    ],


    sassLoader: {
        includePaths: [
            path.resolve( __dirname, "source/sass" )
        ]
    },

    plugins: [
        new WebpackOnBuildPlugin(function ( stats ) {
            fs.readFile( "./template/assets/css/app.css", "utf8", function ( error, css ) {
                const opts = {
                    discardComments: {
                        removeAll: true
                    },
                    safe: true
                };

                cssnano.process(css, opts).then(function (result) {
                    fs.writeFile( "./template/assets/css/app.min.css", result);
                });
            });
        }),
        new webpack.ProvidePlugin({
            Promise: "exports?global.Promise!es6-promise",
            fetch: "imports?this=>global!exports?global.fetch!whatwg-fetch"
        })
    ]
};


/**
 *
 * prod
 * Webpack config for JavaScript production build.
 * Waits for initial output of JavaScript and runs minification.
 *
 */
prod = {
    resolve: {
        root: path.resolve( __dirname ),
    },


    entry: {
        "app": path.resolve( __dirname, "template/assets/js/app.js" )
    },


    output: {
        path: path.resolve( __dirname, "template/assets/js" ),
        filename: "[name].min.js"
    },


    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            comments: false,
            compress: {
                warnings: false
            },
            mangle: true
        })
    ]
};


module.exports = [
    dev,
    prod
];