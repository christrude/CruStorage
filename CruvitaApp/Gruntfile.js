'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    wiredep: 'grunt-wiredep',
    injector: 'grunt-injector',
    uglify: 'grunt-contrib-uglify',
    ngAnnotate: 'grunt-ng-annotate'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/*',
            '!<%= yeoman.dist %>/.git*',
            '!<%= yeoman.dist %>/.openshift',
            '!<%= yeoman.dist %>/Procfile'
          ]
        }]
      },
      serve: '.tmp'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/server/app.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js',
          '!<%= yeoman.client %>/app/app.js',
          '<%= yeoman.client %>/index.controller.js'],
        tasks: ['injector:scripts']
      },
      injectSass: {
        files: ['<%= yeoman.client %>/{app,components}/**/*.{scss,sass}'],
        tasks: ['injector:sass', 'compass', 'autoprefixer']
      },
      css: {
        files: ['<%= yeoman.client %>/app/*.css'],
        tasks:['injector:css'],
        options: {
          livereload: true,
          force: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.css',
          '{.tmp,<%= yeoman.client %>}/*.html',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/*.js',
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*.spec.js',
          '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '<%= yeoman.client %>/.jshintrc',
        reporter: require('jshint-stylish'),
      },
      dist: {
        src: [
        '<%= yeoman.dist %>/**/*.js',
        '!<%= yeoman.dist %>/public/bower_components/**/*.js',
        '!<%= yeoman.dist %>/public/app/*.vendor.js'
        ]
      },
      all: {
        options: {
          jshintrc: 'server/.jshintrc'
        },
        src: [
          'server/{,*/}*.js',
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '!<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      },
      test: {
        src: [
          '<%= yeoman.client %>/{app,components}/**/*.spec.js',
          '<%= yeoman.client %>/{app,components}/**/*.mock.js'
        ]
      }
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost'
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      build: {
        src: ['<%= yeoman.client %>/index.html', '<%= yeoman.client %>/app/app.scss'],
        devDependencies: true,
        exclude: [/bootstrap-sass/, /bootstrap.js/, /bootstrap.css/ ]
      }
    },

    // // Renames files for browser caching purposes
    // rev: {
    //   dist: {
    //     files: {
    //       src: [
    //         '<%= yeoman.dist %>/public/{,*/}*.js',
    //         '!<%= yeoman.dist %>/public/bower_components/*.js',
    //         '<%= yeoman.dist %>/public/{,*/}*.css',
    //         '<%= yeoman.dist %>/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
    //         '<%= yeoman.dist %>/public/assets/fonts/*'
    //       ]
    //     }
    //   }
    // },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/public/{,*/}*.js', '!<%= yeoman.dist %>/public/bower_components/*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/public',
          '<%= yeoman.dist %>/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      options: {
        singleQuotes: true,
        separator: ';'
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: 'app/*.min.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // uglify task were not previously defined. Doing that now.
    uglify: {
      options: {
        report: 'min',
        mangle: false
      },
      generated:{
        files: {
          'dist/public/app/app.min.js': ['.tmp/concat/app/app.min.js']
        }
      }
    },

    cssmin: {
      options: {
        report: 'min',
        keepSpecialComments: 0
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist/public/app',
          src: ['*.css', '!*.min.css'],
          dest: 'dist/public/app',
          ext: '.min.css'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'cruvitaApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.min.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      }
    },

    //Setting up concat options
    concat: {
      options: {
        separator: ';\n'
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            '{app,components}/**/*.css',
            'assets/images/{,*/}*.{webp}',
            'assets/fonts/**/*',
            'index.html',
            'app/schoolwidget/schoolwidget-external.js',
            'app/schoolwidget/schoolwidget.css'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>',
          src: [
            'package.json',
            'server/**/*'
          ]
        }, {//font-awesomefix
            expand: true,
            dot: true,
            cwd: '<%= yeoman.client %>/bower_components/font-awesome',
            src: ['fonts/*.*'],
            dest: '<%= yeoman.dist %>/public'
        }]
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      serve: [
        'compass'
        // 'imagemin'
      ],
      dist: [
        'compass',
        'imagemin'
      ]
    },

    // Compiles Sass to CSS
    compass: {
      'dist': {
        options: {
          environment: 'production',
          sassDir:'<%= yeoman.client %>/app/',
          specify: ['<%= yeoman.client %>/app/app.scss',  '<%= yeoman.client %>/app/schoolwidget/schoolwidget.scss'],
          cssDir:'<%= yeoman.client %>/app/',
        }
      }
    },

    injector: {
      options: {
        relative: false
      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
              ['{.tmp,<%= yeoman.client %>}/{app,components}/**/*.js',
               '!{.tmp,<%= yeoman.client %>}/app/app.js',
               '<%= yeoman.client %>/index.controller.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.spec.js',
               '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*.mock.js']
            ]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/app/', '');
            filePath = filePath.replace('/client/components/', '../components/');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/app/app.scss': [
            '<%= yeoman.client %>/{app,components}/**/*.{scss,sass}',
            '!<%= yeoman.client %>/app/app.{scss,sass}'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      },
      distjs: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/dist/', 'public/');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          'dist/public/index.html': [
            'dist/public/app/*.js',
          ]
        }
      },
      distcss: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/dist/public', '');
            return '<link rel="stylesheet" href="' + filePath + '" type="text/css" media="screen, projection">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          'dist/public/index.html': [
            'dist/public/app/*.min.css', '!dist/public/app/*-print.min.css', '!dist/public/app/vendor.min.css'
          ]
        }
      },
      distcssPrint: {
        options: {
          transform: function(filePath) {
            filePath = filePath.replace('/dist/public', '');
            return '<link rel="stylesheet" href="' + filePath + '" type="text/css" media="print">';
          },
          starttag: '<!-- injector:cssp -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          'dist/public/index.html': [
            'dist/public/app/*-print.min.css'
          ]
        }
      }
    }
  });

/*
**********************************************************************
**********************************************************************
****************************  Tasks  *********************************
**********************************************************************
**********************************************************************
*/

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function() {
    this.async();
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run([
        'build',
        'express:prod',
        'express-keepalive'
      ]);
    }

    grunt.task.run([
      'clean:serve',
      'injector:sass',
      'injector:scripts',
      'wiredep',
      'concurrent:serve',
      'autoprefixer',
      'express:dev',
      'wait',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean:dist',
    'wiredep',
    'injector:sass',
    'concurrent:dist',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cssmin',
    'uglify:generated',
    'usemin',
    'injector:distjs',
    'injector:distcss',
    'injector:distcssPrint'
  ]);
};
