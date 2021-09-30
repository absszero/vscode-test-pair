import * as vscode from 'vscode';
import { basename } from 'path';

const FILENAME_PLACEHOLDER = '@@';

let extensions : Array<any> = vscode.workspace.getConfiguration().get('testPair.testFileExtensions', []);
extensions = extensions.map(ext => {
    ext.extension = ext.extension.toLowerCase();
    return ext;
});

/**
 * get filename component
 * @param path file path
 * @returns
 */
export function filenameComponent(path: string) {
    const filename: string = basename(path);
    const splitFilename: string[] = filename.split(".");
    const base: string = splitFilename.slice(0,-1).join('');
    const extension: string = splitFilename[splitFilename.length-1].toLowerCase();

    return {filename, base, extension};
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerTextEditorCommand('extension.test-pair',
    async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
        const fc = filenameComponent(editor.document.fileName);
        let globs: Array<string> = [];
        for (let i = 0; i < extensions.length; i++) {
            if (extensions[i]['extension'] === fc.extension) {
                globs = extensions[i].globs;
                break;
            }
        }

        if (0 === globs.length) {
            vscode.window.showWarningMessage('TestPair: Unable to match the file extension');
            return;
        }

        let found = false;
        for (let glob of globs) {
            const filter = glob.split(FILENAME_PLACEHOLDER).filter(n => n);
            const isTestFile = filter.some(part => -1 !== fc.filename.indexOf(part));

            if (isTestFile) {
                glob = fc.filename;
                for (const part of filter) {
                    glob = glob.split(part).join('');
                }
                glob += '.' + fc.extension;
            } else {
                glob = glob.replace(FILENAME_PLACEHOLDER, fc.base);
            }

            glob = '**/' + glob;

            let uris = await vscode.workspace.findFiles(glob);
            if (0 === uris.length) {
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
            vscode.window.showWarningMessage('TestPair: Unable to find the pair file');
        }
    });

    context.subscriptions.push(disposable);
}
