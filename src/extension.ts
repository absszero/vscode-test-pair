import * as vscode from 'vscode';
import { basename } from 'path';
const minimatch = require("minimatch");

const FILENAME_PLACEHOLDER = '@@';
const MAX_RESULTS = 3;

/**
 * init defaultextension globs
 * @returns
 */
export function initExtensionGlobs() : Array<any> {
    let extensions : Array<any> = vscode.workspace.getConfiguration().get('testPair.fileExtensions', []);
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
 * @param extGlobs
 * @param fc
 * @returns
 */
export function getPairGlob(extGlobs: any, fc: any) : string {
    const isTestFile = minimatch(fc.filename, extGlobs.testGlob.replace(FILENAME_PLACEHOLDER, '*'));
    let glob = extGlobs.testGlob.replace(FILENAME_PLACEHOLDER, fc.base);;
    if (isTestFile) {
        if (!extGlobs.sourceGlob) {
            return '';
        }
        const filter = spreadGlobs(extGlobs.sourceGlob.split(FILENAME_PLACEHOLDER));
        glob = fc.base;
        for (const part of filter) {
            glob = glob.split(part).join('');
        }
        let sourceExt = extGlobs.sourceExt ?? extGlobs.extension;
        glob += '.' + sourceExt;
    }

    return glob;
}

export function activate(context: vscode.ExtensionContext) {
    const extensions = initExtensionGlobs();
    const excludes = vscode.workspace.getConfiguration().get('testPair.exclusion', null);

    let disposable = vscode.commands.registerTextEditorCommand('extension.test-pair',
    async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
        const fc = filenameComponent(editor.document.fileName);
        let extensionGlobs = {};
        for (let i = 0; i < extensions.length; i++) {
            if (extensions[i]['extension'] === fc.extension) {
                extensionGlobs = extensions[i];
                break;
            }
        }

        if (0 === Object.keys(extensionGlobs).length) {
            vscode.window.showWarningMessage('TestPair: Unable to match the file extension');
            return;
        }

        const glob = getPairGlob(extensionGlobs, fc);
        if (!glob) {
            vscode.window.showWarningMessage('TestPair: Unable to find the pair glob pattern');
            return;
        }

        let uris = await vscode.workspace.findFiles('**/' + glob, excludes, MAX_RESULTS);
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
