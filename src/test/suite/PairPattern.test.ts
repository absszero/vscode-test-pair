import * as assert from 'assert';
import { filenameComponent } from '../../FileComponent';
import { Rule } from '../../Rule';
import { getPairPattern } from '../../PairPattern';

suite('PairPattern Test Suite', () => {
	test('getPairPattern source file test', () => {
        let rule : Rule = {
            extension: 'js',
            testGlob: '@@{.spec,.test}.{ts,js}',
            sourceGlob: '@@{.spec,.test}',
        };

        let fc = filenameComponent('Example.ts');

        let pairPattern = getPairPattern(rule, fc);

        assert.strictEqual(pairPattern.glob, 'Example{.spec,.test}.{ts,js}');
        assert.strictEqual(pairPattern.isTestFile, false);
        assert.deepStrictEqual(pairPattern.testFilenames, [
            'Example.spec.ts',
            'Example.spec.js',
            'Example.test.ts',
            'Example.test.js',
        ]);
	});

	test('getPairPattern test file test', () => {
        let rule : Rule = {
            extension: 'js',
            testGlob: '@@{.spec,.test}.{ts,js}',
            sourceGlob: '@@{.spec,.test}',
        };

        let fc = filenameComponent('Example.spec.ts');

        let pairPattern = getPairPattern(rule, fc);

        assert.strictEqual(pairPattern.glob, 'Example.js');
        assert.strictEqual(pairPattern.isTestFile, true);
        assert.deepStrictEqual(pairPattern.testFilenames, []);
	});
});
