var path = require('path');

module.exports = function(grunt) {
    grunt.initConfig({
        env: {
            development: {
                NODE_ENV: 'dev',
                NODE_CONFIG_DIR : '/Users/radoslavsurov/test_server/jungo-api/etc'
            }
        },
        express: {
            api: {
                options: {
                    script: 'index.js'
                }
            }
        },
        watch: {
            options: {
                livereload: 9999,
            },
            express: {
                files: ['**/*.js', '!**/node_modules/**'],
                tasks: ['express:api'],
                options: {
                    spawn: false
                }
            }
        },
        apidoc: {
            api: {
                src: 'controllers/',
                dest: 'docs/'
            }
        }
    });

    grunt.loadNpmTasks('grunt-express-server');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-apidoc');

    grunt.registerTask('default', ['env', 'express', 'watch']);
    grunt.registerTask('doc', ['apidoc']);
};
