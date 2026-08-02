import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { testDirectories } from '../../FileExplorer';

suite('FileExplorer Test Suite', () => {
	test('testDirectories test', async () => {
    const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
    assert.ok(workspaceRoot, 'Workspace folder is required for FileExplorer tests');

    let dirs = await testDirectories(path.join(workspaceRoot!, 'workspace', 'src', 'Foo', 'NoTestFile.php'), ['NoTestFileTest.php']);
        assert.strictEqual(dirs.length, 3);

    dirs = await testDirectories(path.join(workspaceRoot!, 'workspace', 'src', 'NoTestFile.php'), ['NoTestFileTest.php']);
        assert.strictEqual(dirs.length, 2);
    });
});
