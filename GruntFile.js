module.exports = function(grunt) {
    grunt.initConfig({

        concat: {
            options: {
            },
            dist: {
                src: ['less/_variables.less', 'less/_styles.less', 'src/components/*/*.less'],
                dest: 'less/_concatenated-styles.less'
            }
        },

        less: {

            production: {
                options: {
                    cleancss: false,
                    ieCompat: true,
                    sourceMap: true,
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

        watch: {
            options: {
                livereload: true
            },

            files: [
                "src/components/*/*.less",
                "src/components/*/*.html",
                "src/pages/*/*.html",
                "./less/*.less",
                "bower_components/bootstrap/less/*.less"
            ],
            tasks: ["concat", "less"]
        }

    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['watch']);
    grunt.registerTask('manual', ['concat', 'less']);

};