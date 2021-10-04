import * as assert from 'assert';
import { before } from 'mocha';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { getPairGlob, filenameComponent } from '../../extension';

let editor : vscode.TextEditor;
suite('Extension Test Suite', () => {
	before(async () => {
		vscode.window.showInformationMessage('Start all tests.');
	});

	test('php test', () => {
		let fc = filenameComponent('MyClass.php');
		let glob = getPairGlob(["@@Test.php"], fc);
		assert('**/MyClassTest.php', glob);

		fc = filenameComponent('MyClassTest.php');
		glob = getPairGlob(["@@Test.php"], fc);
		assert('**/MyClass.php', glob);
	});
});
