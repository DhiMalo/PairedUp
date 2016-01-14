module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['client/**/*.js', 'server/**/*.js'],
        dest: 'dist/concat.js'
      }
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    nodemon: {
      dev: {
        script: 'server.js'
      }
    },

    uglify: {
        options: {
      banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
    },
    dist: {
        files: {
          'dist/uglified.min.js': ['dist/PairedUpUgliConcat.js']
        }
      }
    },

    jshint: {
      files: [
        '**/*.js' 
      ],
      options: {
        force: 'true',
        jshintrc: '.jshintrc',
        ignores: [
          'client/assets/lib/**/*.js',
          'dist/**/*.js', //ignore the concatenated/uglified files.
          'node_modules/**/*.js' 
        ]
      }
    },

    cssmin: {
       dist: {
        files: {
          'dist/cssMinFile.min.css': ['client/styles/*.css'] //this will include spacelab.css and style.css
        }
      }
    },

    watch: {
      scripts: {
        files: [
          'client/**/*.js',
          'client/assets/lib/**/*.js',
        ],
        tasks: [
          'concat',
          'uglify'
        ]
      },
      css: {
        files: 'client/styles/*.css',
        tasks: ['cssmin']
      }
    },

    shell: {
      prodServer: {
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-uglify'); // saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-jshint'); // TO DO: add dependency to package.json if utility needed. 
  grunt.loadNpmTasks('grunt-contrib-watch'); // TO DO: add dependency to package.json if utility needed.
  grunt.loadNpmTasks('grunt-contrib-concat'); // saved this dependency.
  grunt.loadNpmTasks('grunt-contrib-cssmin'); // saved this dependency.
  grunt.loadNpmTasks('grunt-mocha-test'); // TO DO: add dependency to package.json if utility needed.
  grunt.loadNpmTasks('grunt-shell'); // TO DO: add dependency to package.json if utility needed.
  grunt.loadNpmTasks('grunt-nodemon'); // TO DO: add dependency to package.json if utility needed.

  grunt.registerTask('server-dev', function (target) {
    // Running nodejs in a different process and displaying output on the main console
    var nodemon = grunt.util.spawn({
         cmd: 'grunt',
         grunt: true,
         args: 'nodemon'
    });
    nodemon.stdout.pipe(process.stdout);
    nodemon.stderr.pipe(process.stderr);

    grunt.task.run([ 'watch' ]); // Working theory of this task: USE WATCH FOR A LIVESTREAM OF SERVER ACTIVITY VIA NODEMON
  });

  ////////////////////////////////////////////////////
  // Main grunt tasks
  ////////////////////////////////////////////////////

  grunt.registerTask('concat1', [
    'concat'
  ]); 

  grunt.registerTask('watch', [
    'watch'
  ]); 
  
  grunt.registerTask('uglify', [
    'uglify'
  ]);

  grunt.registerTask('cssmin', [
    'cssmin'
  ]);

  grunt.registerTask('jshint', [
    'jshint'
  ]);

  grunt.registerTask('test', [
    'mochaTest'
  ]);

  grunt.registerTask('build', [
    'concat', 'uglify', 'cssmin'
  ]);

  grunt.registerTask('upload', function(n) {
    if(grunt.option('prod')) {
      // add your production server task here
    } else {
      grunt.task.run([ 'server-dev' ]);
    }
  });

  grunt.registerTask('deploy', [
      // Consider adding production server tasks here from grunt build.
  ]);

};

