import * as assert from 'assert';
import { before } from 'mocha';
const minimatch = require("minimatch");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getPairGlob, filenameComponent, initExtensionGlobs } from '../../extension';

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	let extensions : any = {};
	before(async () => {
		for (const ext of initExtensionGlobs()) {
			extensions[ext.extension] = ext;
		}

		vscode.window.showInformationMessage('Start all tests.');
	});

	function assertPaired(extGlobs: any, expection: string, filename: string) {
		let fc = filenameComponent(filename);
		let globPatten = getPairGlob(extGlobs, fc);
		assert.strictEqual(true, minimatch(expection, globPatten));
	}

	test('php test', () => {
		let extGlobs = extensions.php;

		assertPaired(extGlobs, 'Foo.php', 'FooTest.php');
		assertPaired(extGlobs, 'FooTest.php', 'Foo.php');
	});

	test('python test', () => {
		let extGlobs = extensions.py;

		assertPaired(extGlobs, 'foo.py', 'test_foo.py');
	});

	test('java test', () => {
		let extGlobs = extensions.java;

		assertPaired(extGlobs, 'Foo.java', 'FooTest.java');
		assertPaired(extGlobs, 'FooTest.java', 'Foo.java');
	});

	test('groovy test', () => {
		let extGlobs = extensions.groovy;

		assertPaired(extGlobs, 'Foo.groovy', 'FooTest.groovy');
		assertPaired(extGlobs, 'FooTest.groovy', 'Foo.groovy');
		assertPaired(extGlobs, 'FooSpec.groovy', 'Foo.groovy');
	});

	test('kotlin test', () => {
		let extGlobs = extensions.kt;

		assertPaired(extGlobs, 'Foo.kt', 'FooTest.kt');
		assertPaired(extGlobs, 'FooTest.kt', 'Foo.kt');
	});

	test('javascript test', () => {
		let extGlobs = extensions.js;

        assertPaired(extGlobs, 'foo.vue', 'foo.spec.ts');
        assertPaired(extGlobs, 'foo.jsx', 'foo.spec.ts');
		assertPaired(extGlobs, 'foo.js', 'foo.spec.ts');

        assertPaired(extGlobs, 'foo.vue', 'foo.test.js');
		assertPaired(extGlobs, 'foo.jsx', 'foo.test.js');
		assertPaired(extGlobs, 'foo.js', 'foo.test.js');

		assertPaired(extGlobs, 'foo.test.js', 'foo.js');
		assertPaired(extGlobs, 'foo.spec.js', 'foo.js');
	});

	test('typescript test', () => {
		let extGlobs = extensions.ts;

        assertPaired(extGlobs, 'foo.vue', 'foo.spec.ts');
        assertPaired(extGlobs, 'foo.jsx', 'foo.spec.ts');
		assertPaired(extGlobs, 'foo.ts', 'foo.spec.ts');

        assertPaired(extGlobs, 'foo.vue', 'foo.test.ts');
		assertPaired(extGlobs, 'foo.jsx', 'foo.test.ts');
		assertPaired(extGlobs, 'foo.ts', 'foo.test.ts');

		assertPaired(extGlobs, 'foo.test.ts', 'foo.ts');
		assertPaired(extGlobs, 'foo.spec.ts', 'foo.ts');
	});

    test('vue test', () => {
		let extGlobs = extensions.vue;

        assertPaired(extGlobs, 'foo.test.ts', 'foo.vue');
        assertPaired(extGlobs, 'foo.spec.ts', 'foo.vue');
    });

    test('jsx test', () => {
		let extGlobs = extensions.jsx;

        assertPaired(extGlobs, 'foo.test.ts', 'foo.jsx');
        assertPaired(extGlobs, 'foo.spec.ts', 'foo.jsx');
    });

	test('ruby test', () => {
		let extGlobs = extensions.rb;

		assertPaired(extGlobs, 'foo.rb', 'foo_spec.rb');
		assertPaired(extGlobs, 'foo.rb', 'foo_test.rb');
		assertPaired(extGlobs, 'foo_spec.rb', 'foo.rb');
		assertPaired(extGlobs, 'foo_test.rb', 'foo.rb');
	});

	test('go test', () => {
		let extGlobs = extensions.go;

		assertPaired(extGlobs, 'foo.go', 'foo_test.go');
		assertPaired(extGlobs, 'foo_test.go', 'foo.go');
	});

	test('swift test', () => {
		let extGlobs = extensions.swift;

		assertPaired(extGlobs, 'Foo.swift', 'FooTests.swift');
		assertPaired(extGlobs, 'FooTests.swift', 'Foo.swift');
	});

	test('matlab test', () => {
		let extGlobs = extensions.m;

		assertPaired(extGlobs, 'Foo.m', 'FooTest.m');
		assertPaired(extGlobs, 'FooTest.m', 'Foo.m');
	});

	test('r test', () => {
		let extGlobs = extensions.r;

		assertPaired(extGlobs, 'foo.r', 'test_foo.r');
		assertPaired(extGlobs, 'test_foo.r', 'foo.r');
	});

});
