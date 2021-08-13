'use babel';

import fs from 'fs-extra';
import temp from 'temp';
import { vouch } from 'atom-build-spec-helpers';
import { provideBuilder } from '../lib/fpm';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('build-fpm', () => {
    let directory;
    let builder;
    const Builder = provideBuilder();

    beforeEach(() => {
        atom.config.set('build-fpm.general', {compiler: '', profile: ''})
        waitsForPromise(() => {
            return vouch(temp.mkdir, 'build-fpm-spec-')
                .then((dir) => vouch(fs.realpath, dir))
                .then((dir) => (directory = `${dir}/`))
                .then((dir) => builder = new Builder(dir));
        });
    });

    afterEach(() => {
        fs.removeSync(directory);
    });

    describe('when fpm.toml exists', () => {
        beforeEach(() => {
            fs.writeFileSync(directory + 'fpm.toml', fs.readFileSync(`${__dirname}/fpm.toml`));
        });

        it('should be eligible', () => {
            expect(builder.isEligible(directory)).toBe(true);
        });

        it('should yield available targets', () => {
            waitsForPromise(() => {
                return Promise.resolve(builder.settings(directory)).then((settings) => {
                    expect(settings.length).toBe(1); // build target

                    const defaultTarget = settings[0]; // build MUST be first
                    expect(defaultTarget.name).toBe('fpm build');
                    expect(defaultTarget.exec).toBe('fpm');
                    expect(defaultTarget.args).toContain('build');
                    expect(defaultTarget.sh).toBe(false);
                });
            });
        });
    });

    describe('when fpm.toml does not exist', () => {
        it('should not be eligible', () => {
            expect(builder.isEligible(directory)).toBe(false);
        });
    });
});
