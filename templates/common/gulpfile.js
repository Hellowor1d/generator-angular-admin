var gulp = require("gulp");
var gutil = require("gulp-util");
var fs = require("fs");
var jade = require("gulp-jade")
    , less = require("gulp-less")
    , minCss = require("gulp-minify-css");

var webpack = require("webpack")
    , webpackConfig = require("./webpack.config.js");
//, WebpackDevServer = require("webpack-dev-server");

//启动server
gulp.task("default", ["webpack-dev-server"]);

//本地编译
//Production task
gulp.task("build", ["webpack:build", "jade:build", "less:build-dev", "fonts:move", "pic:move"]);
//Dev task
gulp.task("build-dev", ["webpack:build-dev", "jade:build-dev", "less:build", "fonts:move", "pic:move"], function () {
    gulp.watch(["src/**/*"], ["webpack:build-dev"]);
    gulp.watch("src/**/*.jade", ["jade:build-dev"])
        .on("change", function (event) {
            //devJadeSrc = event.path;
        });
    gulp.watch("src/**/*.(less|css)", ["less:build-dev"]);

});
gulp.task("fonts:move", function (callback) {
    gulp.src("./src/fonts/*.*")
        .pipe(gulp.dest("./build/fonts/"));
    callback();
});
gulp.task("pic:move", function (callback) {
    gulp.src("./src/images/**/*")
        .pipe(gulp.dest("./build/images/"));
    callback();
});
gulp.task("less:build", function (callback) {
    gulp.src("./src/styles/*.less", {base: "./src/"})
        .pipe(less())
        .pipe(minCss())
        .pipe(gulp.dest("./build"));
    callback();
});



gulp.task("webpack:build", function (callback) {
    var myConfig = Object.create(webpackConfig);
    myConfig.plugins = myConfig.plugins.concat(
        new webpack.DefinePlugin({
            "process.env": {
                "NODE_ENV": JSON.stringify("production")
            }
        }),
        new webpack.optimize.DedupePlugin(),
        new webpack.optimize.UglifyJsPlugin()
    );
    // run webpack
    webpack(myConfig, function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:build", err);
        gutil.log("[webpack:build]", stats.toString({
            colors: true
        }));
        callback();
    });
});

var myDevConfig = Object.create(webpackConfig);
myDevConfig.devtool = "sourcemap";
myDevConfig.debug = true;

var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function (callback) {
    // run webpack
    devCompiler.run(function (err, stats) {
        if (err) throw new gutil.PluginError("webpack:build-dev", err);
        gutil.log("[webpack:build-dev]", stats.toString({
            colors: true
        }));
        callback();
    });
});

gulp.task("webpack-dev-server", function (callback) {
    // modify some webpack config options
    var myConfig = Object.create(webpackConfig);
    myConfig.devtool = "eval";
    myConfig.debug = true;

    /*
     new WebpackDevServer(webpack(myConfig), {
     publicPath: "/" + myConfig.output.publicPath,
     stats: {
     colors: true
     }
     }).listen(8080, "localhost", function (err) {
     if (err) throw new gutil.PluginError("webpack-dev-server", err);
     gutil.log("[webpack-dev-server]", "http://localhost:8080/webpack-dev-server/index.html");
     });
     */
});
var devJadeSrc = "./src/**/*.pug";
gulp.task("jade:build-dev", function (callback) {
    gulp.src(devJadeSrc, {base: "./src/"})
        .pipe(jade({
            pretty: true
        }))
        .pipe(gulp.dest("./build"));
    callback();
});
gulp.task("jade:build", function (callback) {
    gulp.src(devJadeSrc, {base: "./src/"})
        .pipe(jade())
        .pipe(gulp.dest("./build"));
    callback();
});
//test web hook again

