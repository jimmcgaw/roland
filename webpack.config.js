module.exports = {
    entry: "./static/jsx/beatbox.jsx",
    output: {
        path: './static/js',
        filename: "beatbox.js"
    },
    module: {
        loaders: [
            { test: /\.js$/, loader: 'babel-loader' },
            { test: /\.jsx$/, loader: 'babel-loader' },
            { test: /\.coffee$/, loader: 'coffee-loader' },
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};