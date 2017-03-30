module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({

        useminPrepare: {
            html: 'index.html',
            options: {
                dest: 'dist'
            }
        },

        usemin:{
            html:['dist/index.html']
        },

        copy:{
            html: { expand: true, src: ['index.html', 'src/**/*.html'], dest: 'dist/'},
            img: { expand: true, src: ['images/**/*'], dest: 'dist/'},
            fonts: { expand: true, src: ['fonts/**/*'], dest: 'dist/'},
            icons: { expand: true, src: ['icons/**/*'], dest: 'dist/'},
            pdfs: { expand: true, src: ['pdfs/**/*'], dest: 'dist/'},
            NDR_ADMIN: { expand: true, src: ['NDR_ADMIN/**/*'], dest: 'dist/'},
            favicon: { src: ['favicon.ico'], dest: 'dist/'},
        },

        uglify: {
            options: {
                mangle: false,
                compress: {
                    drop_console: false
                }
            }
        },

        imagemin: {
          build: {
            files: [{
              expand: true,
              src: ['images/**/*.{png,jpg,gif}'],
              dest: 'dist/'
            }]
          }
        },

        clean: {
          build: ['.tmp']
        },

        concat: {
            less: {
                src: [
                    'images/grunticon/_grunticon-svg.less',
                    //'images/grunticon/_grunticon-png.less',
                    //'images/grunticon/_grunticon-fallback.less',
                    'less/_variables.less',
                    'less/_icons.less',
                    'less/_styles.less',
                    'less/_mixins.less',
                    'src/components/*/*.less',
                    'src/pages/**/*.less'
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
                    // sourceMapFilename : 'css/ndr.css.map',
                    // sourceMapURL: '/css/ndr.css.map' // the complete url and filename put in the compiled css file
                    // sourceMapBasepath: 'css', // Sets sourcemap base path, defaults to current working directory.
                    // sourceMapRootpath: '/' // adds this path onto the sourcemap filename and less file paths
                },
                files: {
                    'css/ndr.css': 'less/_concatenated-styles.less'
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
                    dest: 'images/grunticon'
                }],
                options: {
                    datasvgcss: '_grunticon-svg.less',
                    datapngcss: '_grunticon-png.less',
                    urlpngcss: '_grunticon-fallback.less',
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
                files: ['images/svgmin.svg'],
                tasks: ['grunticon'],
                options: {
                    spawn: false
                }
            },

            less: {
                files: [
                    'src/components/*/*.less',
                    // 'src/components/*/*.html',
                    // 'src/pages/*/*.html',
                    'src/pages/**/*.less',
                    './less/*.less',
                ],
                tasks: ['concat:less', 'less'],
                options: {
                    spawn: false,
                    livereload: 1343
                }
            }
        }

    });

    //imagemin:build'
    grunt.registerTask('default', ['concat:less', 'less']);
    grunt.registerTask('observe', ['watch']);
    grunt.registerTask('build', ['copy', 'useminPrepare', 'concat:generated', 'uglify', 'cssmin', 'usemin', 'clean:build']);
};
