import path = require("path");
import * as vscode from 'vscode';
import { PairPattern } from "./PairPattern";

export const MAX_RESULTS = 3;
const LAST_DIR_NUM = 2;

/**
 * make a test file
 * @param sourceUri
 * @param pattern
 */
export async function makeTestFile(sourceUri: vscode.Uri , pattern: PairPattern): Promise<void> {
    let dirs = path.dirname(sourceUri.path).split(path.sep);
    let items = [];
    for (let index = 0; index < LAST_DIR_NUM; index++) {
        let files = await findFiles('**' + path.sep + dirs.pop() + path.sep + '*');
        if (files) {
            let file = path.dirname(files[0].path) + path.sep + pattern.glob;
            items.push(file);
        }
    }

    const selected = await vscode.window.showQuickPick(items);
    if (selected) {
		const testFileUri = vscode.Uri.parse(selected);
        const testStub = Buffer.from('', 'utf8');
        await vscode.workspace.fs.writeFile(testFileUri, testStub);
        vscode.window.showTextDocument(testFileUri);
    }
}

/**
 * find files
 *
 * @var {[type]}
 */
export function findFiles(glob: vscode.GlobPattern, maxReults = MAX_RESULTS) : Thenable<vscode.Uri[]> {
    const excludes = vscode.workspace.getConfiguration().get('testPair.exclusion', null);
    return vscode.workspace.findFiles(glob, excludes, maxReults);
}