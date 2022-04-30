import * as vscode from 'vscode';
import { basename } from 'path';
import { Rule } from './Rule';
import { filenameComponent } from './FileComponent';
import { getPairPattern } from './PairPattern';
import * as explorer from './FileExplorer';

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

        const pattern = getPairPattern(rule, fc);
        if (!pattern.glob) {
            vscode.window.showWarningMessage('TestPair: Unable to find the pair glob pattern');
            return;
        }

        let uris = await explorer.findFiles('**/' + pattern.glob);
        if (0 === uris.length) {
            if (pattern.isTestFile) {
                vscode.window.showWarningMessage('TestPair: Unable to find the pair file');
                return;
            }

            vscode.window
            .showInformationMessage(`TestPair: Unable to find the test file, Do you want to create it?`, "Yes", "No")
            .then(answer => {
                if (answer === "No") {
                    return;
                }
                explorer.makeTestFile(editor.document.uri, pattern);
            });
            return;
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
