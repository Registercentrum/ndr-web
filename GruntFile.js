module.exports = function(grunt) {
    grunt.initConfig({

        less: {
            development: {
                options: {
                    paths: ["assets/css"]
                },
                files: {"css/styles.css": "less/styles.less"}
            },
            production: {
                options: {
                    paths: ["assets/css"],
                    cleancss: true
                },
                files: {"css/styles.css": "less/styles.less"}
            }

        },

        watch: {
            options: {
                livereload: true
            },

            files: ["src/components/*/*.less", "./less/*.less", "bower_components/bootstrap/less/*.less"],
            tasks: ["less"]
        }

    });
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default','watch');
   // grunt.registerTask('default', ['less']);

};