'use babel';

import fs from 'fs';
import path from 'path';
import os from 'os';
import { EventEmitter } from 'events';

export const config = {
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
    }

    getNiceName() {
      return 'Fortran Package Manager';
    }

    isEligible() {
      return fs.existsSync(path.join(this.cwd, 'fpm.toml'));
    }

    settings() {
      const buildTarget = {
        exec: 'fpm',
        name: 'fpm build',
        args: ['build'],
        sh: false,
        errorMatch: errorMatch,
        warningMatch: warningMatch
      };
      return [buildTarget];
    }
  };
}
