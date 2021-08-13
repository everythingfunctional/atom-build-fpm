'use babel';

import fs from 'fs';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

export const config = {
    general: {
        title: 'General options',
        description: 'Options applicable to build, run and test',
        type: 'object',
        properties: {
            compiler: {
                title: 'Compiler',
                description: 'Which compiler should fpm use?',
                type: 'string',
                default: '',
                order: 1
            },
            profile: {
                title: 'Profile',
                description: 'Which profile (set of compiler flags) should be used?',
                type: 'string',
                default: '',
                order: 2
            }
        }
    }
};

export function provideBuilder() {
  const gccErrorMatch = '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(fatal error|error):\\s*(?<message>.+)';
  const gfortranErrorMatch = '(?<file>[^:\\n]+):(?<line>\\d+):(?<col>\\d+):[\\s\\S]+?Error: (?<message>.+)';
  const errorMatch = [
    gccErrorMatch, gfortranErrorMatch
  ];

  const gccWarningMatch = '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(warning):\\s*(?<message>.+)';
  const warningMatch = [
    gccWarningMatch
  ];

  return class FpmBuildProvider extends EventEmitter {
    constructor(cwd) {
      super();
      this.cwd = cwd;
      atom.config.observe('build-fpm', () => this.emit('refresh'));
    }

    getNiceName() {
      return 'Fortran Package Manager';
    }

    isEligible() {
      return fs.existsSync(path.join(this.cwd, 'fpm.toml'));
    }

    settings() {
      const compiler = atom.config.get('build-fpm.general.compiler')
      const profile = atom.config.get('build-fpm.general.profile')
      let args = ['build']
      if (compiler.length > 0) {args = args.concat(['--compiler', compiler])}
      if (profile.length > 0) {args = args.concat (['--profile', profile])}
      const buildTarget = {
        exec: 'fpm',
        name: 'fpm build',
        args: args,
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };
      return [buildTarget];
    }
  };
}
