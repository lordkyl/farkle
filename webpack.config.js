var path = require('path');

module.exports = {
    mode: 'production',
    entry: {
        app: './game/game.ts',
        createjs: './node_modules/createjs/builds/1.0.0/createjs.js'
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'public/assets'),
        publicPath: "/assets/",
    },
    resolve: {
        alias: {
          createjs: './node_modules/createjs/builds/1.0.0/createjs.js'
        }
    },    
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /node_modules[/\\]createjs/,  
                loaders: [
                  'imports-loader?this=>window',
                  'exports-loader?window.createjs'
                ]
            }            
        ]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    }
};