import * as vscode from 'vscode';
import { basename } from 'path';
import { Rule } from './Rule';
import { FileComponent } from './FileComponent';
const minimatch = require("minimatch");

const FILENAME_PLACEHOLDER = '@@';
const MAX_RESULTS = 3;

/**
 * init default rules
 * @returns
 */
export function initRules() : Array<Rule> {
    let rules : Array<Rule> = vscode.workspace.getConfiguration().get('testPair.rules', []);
    rules = rules.map(rule => {
        rule.extension = rule.extension.toLowerCase();
        return rule;
    });

    return rules;
}

/**
 * get filename component
 * @param path file path
 * @returns
 */
export function filenameComponent(path: string) : FileComponent {
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
 * @param rule
 * @param fc
 * @returns
 */
export function getPairGlob(rule: Rule, fc: any) : string {
    const isTestFile = minimatch(fc.filename, rule.testGlob.replace(FILENAME_PLACEHOLDER, '*'));
    let glob = rule.testGlob.replace(FILENAME_PLACEHOLDER, fc.base);;
    if (isTestFile) {
        if (!rule.sourceGlob) {
            return '';
        }
        const filter = spreadGlobs(rule.sourceGlob.split(FILENAME_PLACEHOLDER));
        glob = fc.base;
        for (const part of filter) {
            glob = glob.split(part).join('');
        }
        let sourceExt = rule.sourceExt ?? rule.extension;
        glob += '.' + sourceExt;
    }

    return glob;
}

export function activate(context: vscode.ExtensionContext) {
    const rules = initRules();
    const excludes = vscode.workspace.getConfiguration().get('testPair.exclusion', null);

    let disposable = vscode.commands.registerTextEditorCommand('extension.test-pair',
    async (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any[]) => {
        const fc = filenameComponent(editor.document.fileName);
        let rule : Rule = {
            extension: '',
            testGlob: '',
            sourceGlob: '',
        };
        for (let i = 0; i < rules.length; i++) {
            if (rules[i]['extension'] === fc.extension) {
                rule = rules[i];
                break;
            }
        }

        if ('' === rule.extension) {
            vscode.window.showWarningMessage('TestPair: Unable to match the file extension');
            return;
        }

        const glob = getPairGlob(rule, fc);
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
