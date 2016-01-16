/**
 * Setup grunt tasks.
 * 
 * @param {object} grunt
 */
module.exports = function(grunt) {
    grunt.initConfig({
        watch: {
            scripts: {
                files: './assets/js/**/*.js',
                tasks: ['browserify']
            },
            styles: {
                files: './assets/scss/**/*.scss',
                tasks: ['sass']
            }
        },
        sass: {
            dist: {
                options: {
                    style: 'compressed'
                },
                files: {
                    './public/css/main.css': './assets/scss/main.scss',
                }
            }
        },
        browserify: {
            dist: {
                options: {
                    debug: true,
                    transform: [['babelify', {
                        presets: ['es2015']
                    }]]
                },
                files: {
                    './public/js/main.js': ['./assets/js/main.js']
                }
            }
        },
        eslint: {
            target: ['./assets/js/**/*.js']
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', ['sass', 'eslint', 'browserify']);
    grunt.registerTask('w', ['watch']);
};