import * as assert from 'assert';
import * as vscode from 'vscode';
import { before } from 'mocha';
import minimatch = require("minimatch");
import { initRules } from '../../extension';
import { filenameComponent } from '../../FileComponent';
import { getPairPattern } from "../../PairPattern";
import { Rule } from '../../Rule';

suite('Extension Test Suite', () => {
	let rules : any = {};
	before(async () => {
		for (const rule of initRules()) {
			rules[rule.extension] = rule;
		}

		vscode.window.showInformationMessage('Start all tests.');
	});

	function assertPaired(rule: Rule, expection: string, filename: string) {
		let fc = filenameComponent(filename);
		let globPattern = getPairPattern(rule, fc);
		assert.strictEqual(true, minimatch(expection, globPattern.glob));
	}

	test('php test', () => {
		let rule = rules.php;

		assertPaired(rule, 'Foo.php', 'FooTest.php');
		assertPaired(rule, 'FooTest.php', 'Foo.php');
	});

	test('python test', () => {
		let rule = rules.py;

		assertPaired(rule, 'foo.py', 'test_foo.py');
	});

	test('java test', () => {
		let rule = rules.java;

		assertPaired(rule, 'Foo.java', 'FooTest.java');
		assertPaired(rule, 'FooTest.java', 'Foo.java');
	});

	test('groovy test', () => {
		let rule = rules.groovy;

		assertPaired(rule, 'Foo.groovy', 'FooTest.groovy');
		assertPaired(rule, 'FooTest.groovy', 'Foo.groovy');
		assertPaired(rule, 'FooSpec.groovy', 'Foo.groovy');
	});

	test('kotlin test', () => {
		let rule = rules.kt;

		assertPaired(rule, 'Foo.kt', 'FooTest.kt');
		assertPaired(rule, 'FooTest.kt', 'Foo.kt');
	});

	test('javascript test', () => {
		let rule = rules.js;

        assertPaired(rule, 'foo.vue', 'foo.spec.ts');
        assertPaired(rule, 'foo.jsx', 'foo.spec.ts');
		assertPaired(rule, 'foo.js', 'foo.spec.ts');

        assertPaired(rule, 'foo.vue', 'foo.test.js');
		assertPaired(rule, 'foo.jsx', 'foo.test.js');
		assertPaired(rule, 'foo.js', 'foo.test.js');

		assertPaired(rule, 'foo.test.js', 'foo.js');
		assertPaired(rule, 'foo.spec.js', 'foo.js');
	});

	test('typescript test', () => {
		let rule = rules.ts;

        assertPaired(rule, 'foo.vue', 'foo.spec.ts');
        assertPaired(rule, 'foo.jsx', 'foo.spec.ts');
		assertPaired(rule, 'foo.ts', 'foo.spec.ts');
		assertPaired(rule, 'foo.tsx', 'foo.spec.ts');

        assertPaired(rule, 'foo.vue', 'foo.test.ts');
		assertPaired(rule, 'foo.jsx', 'foo.test.ts');
		assertPaired(rule, 'foo.ts', 'foo.test.ts');
		assertPaired(rule, 'foo.tsx', 'foo.test.ts');

		assertPaired(rule, 'foo.test.ts', 'foo.ts');
		assertPaired(rule, 'foo.spec.ts', 'foo.ts');
	});

    test('vue test', () => {
		let rule = rules.vue;

        assertPaired(rule, 'foo.test.ts', 'foo.vue');
        assertPaired(rule, 'foo.spec.ts', 'foo.vue');
    });

    test('jsx test', () => {
		let rule = rules.jsx;

        assertPaired(rule, 'foo.test.ts', 'foo.jsx');
        assertPaired(rule, 'foo.spec.ts', 'foo.jsx');
    });

	test('ruby test', () => {
		let rule = rules.rb;

		assertPaired(rule, 'foo.rb', 'foo_spec.rb');
		assertPaired(rule, 'foo.rb', 'foo_test.rb');
		assertPaired(rule, 'foo_spec.rb', 'foo.rb');
		assertPaired(rule, 'foo_test.rb', 'foo.rb');
	});

	test('go test', () => {
		let rule = rules.go;

		assertPaired(rule, 'foo.go', 'foo_test.go');
		assertPaired(rule, 'foo_test.go', 'foo.go');
	});

	test('swift test', () => {
		let rule = rules.swift;

		assertPaired(rule, 'Foo.swift', 'FooTests.swift');
		assertPaired(rule, 'FooTests.swift', 'Foo.swift');
	});

	test('matlab test', () => {
		let rule = rules.m;

		assertPaired(rule, 'Foo.m', 'FooTest.m');
		assertPaired(rule, 'FooTest.m', 'Foo.m');
	});

	test('r test', () => {
		let rule = rules.r;

		assertPaired(rule, 'foo.r', 'test_foo.r');
		assertPaired(rule, 'test_foo.r', 'foo.r');
	});

});
