import path = require("path");
import * as vscode from 'vscode';
import { PairPattern } from "./PairPattern";

export const MAX_RESULTS = 3;
const TEST_DIRECTORY = '**/{test,tests}/';

/**
 * make a test file
 * @param sourceUri
 * @param pattern
 */
export async function makeTestFile(sourceUri: vscode.Uri , pattern: PairPattern): Promise<void> {
    const dirs = await testDirectories(sourceUri.path, pattern.testFilenames);

    // select testing dir location
    let dir : string|undefined = dirs[0];
    if (dirs.length > 1) {
        dir = await vscode.window.showQuickPick(dirs);
        if (!dir) {
            return;
        }
    }

    // select testing filename
    let files = [];
    for (const filename of pattern.testFilenames) {
        files.push(dir + filename);
    }

    let file : string | undefined = files[0];
    if (files.length > 1) {
        file = await vscode.window.showQuickPick(files);
        if (!file) {
            return;
        }
    }

    const testFileUri = vscode.Uri.parse(file);
    const testStub = Buffer.from('', 'utf8');
    await vscode.workspace.fs.writeFile(testFileUri, testStub);
    vscode.window.showTextDocument(testFileUri);
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

/**
 * get test directories
 *
 * @param   {string}              sourcePath     soure file path
 * @param   {string[]<string>[]}  testFilenames  testing filesnames
 *
 * @return  {Promise<string>[]}                  [return description]
 */
export async function testDirectories(sourcePath : string, testFilenames: string[]) : Promise<string[]> {
    // current dir
    let dirs = [
        path.dirname(sourcePath) + path.sep
    ];

    // test dir
    let exts = testFilenames.map(path.extname).filter(uniqure).join(',');
    let files = await findFiles(TEST_DIRECTORY + `*{${exts}}`, 1);
    if (0 === files.length) {
        return dirs;
    }
    let testDir = path.dirname(files[0].path);
    if (testDir === dirs[0]) {
        return dirs;
    }
    dirs.push(testDir + path.sep);

    // the closest test dir
    const splited = dirs[0].split(path.sep);
    const lastDir = splited[splited.length - 2];
    let pattern = new vscode.RelativePattern(testDir, `${lastDir}/*{${exts}}`);
    files = await findFiles(pattern, 1);
    if (files.length) {
        dirs.unshift(path.dirname(files[0].path) + path.sep);
    }

    return dirs;
}

/**
 * remove duplicated strings in array
 *
 * @param   {string}    value  [value description]
 * @param   {Number}    index  [index description]
 * @param   {string[]}  self   [self description]
 *
 * @return  {[]}               [return description]
 */
function uniqure(value: string, index : Number, self: string[]) {
    return self.indexOf(value) === index;
}