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
            },
            flags: {
                title: 'Flags',
                description: 'Any additional flags that should be used?',
                type: 'string',
                default: '',
                order: 3
            }
        }
    },
    run: {
        title: 'Run options',
        description: 'Options for run',
        type: 'object',
        properties: {
            example: {
                title: 'Run examples',
                description: 'Whether to run examples or apps',
                type: 'boolean',
                default: false,
                order: 1
            },
            target: {
                title: 'Execution target',
                description: 'Which executable to run',
                type: 'string',
                default: '',
                order: 2
            },
            runner: {
                title: 'Runner',
                description: 'Command that should be used to run the executable',
                type: 'string',
                default: '',
                order: 3
            },
            executable_arguments: {
                title: 'Executable Arguments',
                description: 'Arguments to be passed to executables',
                type: 'string',
                default: '',
                order: 4
            }
        }
    },
    test: {
        title: 'Test options',
        description: 'Options for test',
        type: 'object',
        properties: {
            target: {
                title: 'Execution target',
                description: 'Which test to run',
                type: 'string',
                default: '',
                order: 1
            },
            runner: {
                title: 'Runner',
                description: 'Command that should be used to run the executable',
                type: 'string',
                default: '',
                order: 2
            },
            executable_arguments: {
                title: 'Executable Arguments',
                description: 'Arguments to be passed to executables',
                type: 'string',
                default: '',
                order: 3
            }
        }
    }
};

export function provideBuilder() {
    const gccErrorMatch = '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(fatal error|error):\\s*(?<message>.+)';
    const gfortranErrorMatch = '(?<file>[^:\\n]+):(?<line>\\d+):(?<col>\\d+):[\\s\\S]+?Error: (?<message>.+)';
    const errorMatch = [gccErrorMatch, gfortranErrorMatch];

    const gccWarningMatch = '(?<file>([A-Za-z]:[\\/])?[^:\\n]+):(?<line>\\d+):(?<col>\\d+):\\s*(warning):\\s*(?<message>.+)';
    const warningMatch = [gccWarningMatch];

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
            const flags = atom.config.get('build-fpm.general.flags')
            let general_args = ['build']
            if (compiler.length > 0) {general_args = general_args.concat(['--compiler', compiler])}
            if (profile.length > 0) {general_args = general_args.concat(['--profile', profile])}
            if (flags.length > 0) {general_args = general_args.concat(['--flag', flags])}
            const buildTarget = {
                exec: 'fpm',
                name: 'fpm build',
                args: general_args,
                sh: false,
                errorMatch: errorMatch,
                warningMatch: warningMatch
            };

            const run_example = atom.config.get('build-fpm.run.example')
            const run_target = atom.config.get('build-fpm.run.target')
            const run_runner = atom.config.get('build-fpm.run.runner')
            const run_exe_args = atom.config.get('build-fpm.run.executable_arguments')
            let run_args = ['run']
            if (compiler.length > 0) {run_args = run_args.concat(['--compiler', compiler])}
            if (profile.length > 0) {run_args = run_args.concat(['--profile', profile])}
            if (flags.length > 0) {run_args = run_args.concat(['--flag', flags])}
            if (run_example) {run_args = run_args.concat(['--example'])}
            if (run_target.length > 0) {run_args = run_args.concat(['--target', run_target])}
            if (run_runner.length > 0) {run_args = run_args.concat(['--runner', run_runner])}
            if (run_exe_args.length > 0) {run_args = run_args.concat([' -- ', run_exe_args])}
            const runTarget = {
                exec: 'fpm',
                name: 'fpm run',
                args: run_args,
                sh: false,
                errorMatch: errorMatch,
                warningMatch: warningMatch
            };

            const test_target = atom.config.get('build-fpm.run.target')
            const test_runner = atom.config.get('build-fpm.run.runner')
            const test_exe_args = atom.config.get('build-fpm.run.executable_arguments')
            let test_args = ['test']
            if (compiler.length > 0) {test_args = test_args.concat(['--compiler', compiler])}
            if (profile.length > 0) {test_args = test_args.concat(['--profile', profile])}
            if (flags.length > 0) {test_args = test_args.concat(['--flag', flags])}
            if (test_target.length > 0) {test_args = test_args.concat(['--target', test_target])}
            if (test_runner.length > 0) {test_args = test_args.concat(['--runner', test_runner])}
            if (test_exe_args.length > 0) {test_args = test_args.concat([' -- ', test_exe_args])}
            const testTarget = {
                exec: 'fpm',
                name: 'fpm test',
                args: test_args,
                sh: false,
                errorMatch: errorMatch,
                warningMatch: warningMatch
            };

            return [buildTarget, runTarget, testTarget];
        }
    };
}
