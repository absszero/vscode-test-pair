import * as vscode from 'vscode';
import { basename } from 'path';
const minimatch = require("minimatch");

const FILENAME_PLACEHOLDER = '@@';

let extensions = initExtensionGlobs();

/**
 * init defaultextension globs
 * @returns
 */
function initExtensionGlobs() : Array<any> {
    let extensions : Array<any> = vscode.workspace.getConfiguration().get('testPair.testFileExtensions', []);
    extensions = extensions.map(ext => {
        ext.extension = ext.extension.toLowerCase();
        return ext;
    });

    return extensions;
}

/**
 * get filename component
 * @param path file path
 * @returns
 */
export function filenameComponent(path: string) {
    const filename: string = basename(path);
    const splitFilename: string[] = filename.split(".");
    const base: string = splitFilename.slice(0,-1).join('.');
    const extension: string = splitFilename[splitFilename.length-1].toLowerCase();

    return {filename, base, extension};
}

/**
 * spread the glob patterns
 * @param globs
 * @returns
 */
function spreadGlobs(globs: Array<string>) : Array<string> {
    let idx = 0;
    while(undefined !== globs[idx]) {
        const glob = globs[idx];

        let start = glob.indexOf('{');
        if (-1 === start) {
            idx++;
            continue;
        }
        let end = glob.indexOf('}');
        if (-1 === end || end <= start) {
            idx++;
            continue;
        }

        let replacedPart = glob.substring(start, end + 1);
        let parts = replacedPart.substring(1, replacedPart.length - 1).split(',');
        if (0 === parts.length) {
            idx++;
            continue;
        }
        for (const part of parts) {
            let newGlob = glob.replace(replacedPart, part);
            globs.push(newGlob);
        }
        globs[idx] = '';
        idx++;
    }

    return globs.filter(n => n);
}

/**
 * get pair glob
 * @param globs
 * @param fc
 * @returns
 */
export function getPairGlob(globs: Array<string>, fc: any) : string {

    for (let glob of globs) {
        const isTestFile = minimatch(fc.filename, glob.replace(FILENAME_PLACEHOLDER, '*'));

        if (isTestFile) {
            const filter = spreadGlobs(glob.split(FILENAME_PLACEHOLDER));
            glob = fc.filename;
            for (const part of filter) {
                glob = glob.split(part).join('');
            }
            glob += '.' + fc.extension;
        } else {
            glob = glob.replace(FILENAME_PLACEHOLDER, fc.base);
        }

        return glob;
    }

    return "";
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

        const glob = '**/' + getPairGlob(globs, fc);
        let uris = await vscode.workspace.findFiles(glob);
        if (0 === uris.length) {
            vscode.window.showWarningMessage('TestPair: Unable to find the pair file');
        }

        if (1 === uris.length) {
            vscode.commands.executeCommand('vscode.open', vscode.Uri.file(uris[0].path));
            return;
        }

        uris.sort(function (a, b) {
            return basename(a.path).length - basename(b.path).length;
        });

        vscode.commands.executeCommand('workbench.action.quickOpen', basename(uris[0].path));
    });

    context.subscriptions.push(disposable);
}
