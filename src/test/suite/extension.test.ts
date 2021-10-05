import * as assert from 'assert';
import { before } from 'mocha';
const minimatch = require("minimatch");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getPairGlob, filenameComponent } from '../../extension';

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	before(async () => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	function assertPaired(glob: string, filename: string, testFilename: string) {
		let fc = filenameComponent(filename);
		let globPatten = getPairGlob([glob], fc);
		assert.strictEqual(true, minimatch(testFilename, globPatten));

		fc = filenameComponent(testFilename);
		globPatten = getPairGlob([glob], fc);
		// console.log(globPatten);
		assert.strictEqual(true, minimatch(filename, globPatten));
	}

	test('php test', () => {
		assertPaired("@@Test.php", 'MyClass.php', 'MyClassTest.php');
	});

	test('python test', () => {
		assertPaired("test_@@.py", 'foo.py', 'test_foo.py');
	});

	test('java test', () => {
		assertPaired("@@Test.java", 'MyClass.java', 'MyClassTest.java');
	});

	test('kotlin test', () => {
		assertPaired("@@Test.kt", 'MyClass.kt', 'MyClassTest.kt');
	});

	test('javascript test', () => {
		assertPaired("@@.{spec,test}.{ts,js}", 'foo.js', 'foo.spec.js');
		assertPaired("@@.{spec,test}.{ts,js}", 'foo.js', 'foo.test.js');
	});

	test('typescript test', () => {
		assertPaired("@@.{spec,test}.ts", 'foo.ts', 'foo.spec.ts');
		assertPaired("@@.{spec,test}.ts", 'foo.ts', 'foo.test.ts');
	});

    // test('vue test', () => {
    //     assertPaired("@@.{spec,test}.{js,ts,vue}", 'foo.vue', 'foo.spec.ts');
    //     assertPaired("@@.{spec,test}.{js,ts,vue}", 'foo.vue', 'foo.test.ts');
    // });

});
