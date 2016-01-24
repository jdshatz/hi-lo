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
            main: {
                options: {
                    debug: true,
                    transform: [
                        ['babelify', {
                            presets: ['es2015'],
                        }]
                    ],
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    './public/js/app.bundle.js': ['./assets/js/main.js']
                }
            },
            test: {
                options: {
                    debug: true,
                    transform: [
                        ['babelify', {
                            presets: ['es2015'],
                        }]
                    ],
                    browserifyOptions: {
                        debug: true
                    }
                },
                files: {
                    './tests/test.bundle.js': ['./assets/js/**/*.test.js']
                }
            }
        },
        eslint: {
            target: ['./assets/js/**/*.js']
        },
        mocha: {
            test: {
                src: ['./tests/index.html'],
                options: {
                    reporter: 'Spec',
                    log: true,
                    logErrors: true,
                    run: true
                }
            }
        },
        uglify: {
            main: {
                files: {
                    './public/js/app.bundle.min.js': ['./public/js/app.bundle.js']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-mocha');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-eslint');

    grunt.registerTask('default', ['sass', 'eslint', 'browserify', 'mocha:test', 'uglify']);
    grunt.registerTask('w', ['watch']);
    grunt.registerTask('test', ['browserify:test', 'mocha:test']);
    grunt.registerTask('lint', ['eslint']);
};