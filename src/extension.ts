import * as vscode from 'vscode';
import { basename } from 'path';

const FILENAME_PLACEHOLDER = '@@';

let extensions : Array<any> = vscode.workspace.getConfiguration().get('testPair.testFileExtensions', []);
extensions = extensions.map(ext => {
    ext.extension = ext.extension.toLowerCase();
    return ext;
});

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('extension.test-pair',
    async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
        const splitFileName: string[] = basename(editor.document.fileName).split(".");
        const fileName: string = splitFileName.slice(0,-1).join('');
        const extension: string = splitFileName[splitFileName.length-1].toLowerCase();

        let globs: Array<string> = [];
        for (let i = 0; i < extensions.length; i++) {
            if (extensions[i]['extension'] === extension) {
                globs = extensions[i].globs;
                break;
            }
        }

        if (0 === globs.length) {
            vscode.window.showWarningMessage('Test Pair: Unable to find pair for the file extension');
            return;
        }

        let found = false;
        for (let glob of globs) {
            glob = glob.replace(FILENAME_PLACEHOLDER, fileName);
            let uris = await vscode.workspace.findFiles(glob);
            if (0 === uris.length) {
                console.log( 123 );
                continue;
            }
            if (1 === uris.length) {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.file(uris[0].path));
                found = true;
                break;
            }

            uris.sort(function (a, b) {
                return basename(a.path).length - basename(b.path).length;
            });

            vscode.commands.executeCommand('workbench.action.quickOpen', basename(uris[0].path));
            found = true;
            break;
        }

        if (!found) {
            vscode.window.showWarningMessage('Test Pair: Unable to find the pair file');
        }
    });

    context.subscriptions.push(disposable);
}
