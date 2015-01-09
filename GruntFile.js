module.exports = function(grunt) {
    grunt.initConfig({

        concat: {
            options: {
            },
            dist: {
                src: [
                    'images/grunticon/_grunticon-svg.less',
                    //'images/grunticon/_grunticon-png.less',
                    //'images/grunticon/_grunticon-fallback.less',
                    'less/_variables.less',
                    'less/_styles.less',
                    'src/components/*/*.less',
                    'src/pages/*/*.less'
                ],
                dest: 'less/_concatenated-styles.less'
            }
        },

        less: {

            production: {
                options: {
                    cleancss: false,
                    ieCompat: true,
                    sourceMap: true
                    // sourceMapFilename : "css/ndr.css.map",
                    // sourceMapURL: '/css/ndr.css.map' // the complete url and filename put in the compiled css file
                    // sourceMapBasepath: 'css', // Sets sourcemap base path, defaults to current working directory.
                    // sourceMapRootpath: '/' // adds this path onto the sourcemap filename and less file paths
                },
                files: {
                    "css/ndr.css": "less/_concatenated-styles.less"
                }
            }
        },

        svgmin: {
            options: {
                plugins: [
                    {
                        removeViewBox: false
                    }, {
                        removeUselessStrokeAndFill: false
                    }
                ]
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: 'images/svg/',
                    src: ['*.svg'],
                    dest: 'images/svgmin/'
                }]
            }
        },

        grunticon: {
            grunticon: {
                files: [{
                    expand: true,
                    cwd: 'images/svgmin',
                    src: ['*.svg', '*.png'],
                    dest: "images/grunticon"
                }],
                options: {
                    datasvgcss: "_grunticon-svg.less",
                    datapngcss: "_grunticon-png.less",
                    urlpngcss: "_grunticon-fallback.less",
                    pngfolder: 'png',
                    cssprefix: '.grunticon-',
                    pngpath: 'grunticon/png/'
                }
            }
        },

        watch: {

            svgmin: {
                files: ['images/svg/*.svg'],
                tasks: ['svgmin'],
                options: {
                    spawn: false
                }
            },

            grunticon: {
                files: ['images/svgmin/*.svg'],
                tasks: ['grunticon'],
                options: {
                    spawn: false
                }
            },

            scripts: {
                files: [
                    "src/components/*/*.less",
                    "src/components/*/*.html",
                    "src/pages/*/*.html",
                    "src/pages/*/*.less",
                    "./less/*.less",
                    "bower_components/bootstrap/less/*.less"
                ],
                tasks: ['concat', 'less'],
                options: {
                    spawn: false,
                    livereload: true
                }
            }
        }

    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-grunticon');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['watch']);
    grunt.registerTask('manual', ['concat', 'less']);

};