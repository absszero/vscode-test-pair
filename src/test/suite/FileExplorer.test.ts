import * as assert from 'assert';
import { testDirectories } from '../../FileExplorer';

suite('FileExplorer Test Suite', () => {
	test('testDirectories test', async () => {
        let dirs = await testDirectories('/Volumes/data/develop/www/vscode-test-pair/demo/src/Foo/NoTestFile.php', ['NoTestFileTest.php']);
        assert.strictEqual(dirs.length, 3);

        dirs = await testDirectories('/Volumes/data/develop/www/vscode-test-pair/demo/src/NoTestFile.php', ['NoTestFileTest.php']);
        assert.strictEqual(dirs.length, 2);
    });
});
