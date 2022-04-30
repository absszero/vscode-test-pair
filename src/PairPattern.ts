import { Rule } from './Rule';
const minimatch = require("minimatch");
const FILENAME_PLACEHOLDER = '@@';

export interface PairPattern {
    glob: string,
    isTestFile: string,
    testFilenames: string[]
}

/**
 * get pair glob
 * @param rule
 * @param fc
 * @returns
 */
export function getPairPattern(rule: Rule, fc: any): PairPattern {
    const isTestFile = minimatch(fc.filename, rule.testGlob.replace(FILENAME_PLACEHOLDER, '*'));
    let glob = rule.testGlob.replace(FILENAME_PLACEHOLDER, fc.base);
    let testFilenames : string[] = [];
    if (isTestFile) {
        if (!rule.sourceGlob) {
            return {glob, isTestFile, testFilenames};
        }
        const filter = spreadGlobs(rule.sourceGlob.split(FILENAME_PLACEHOLDER));
        glob = fc.base;
        for (const part of filter) {
            glob = glob.split(part).join('');
        }
        let sourceExt = rule.sourceExt ?? rule.extension;
        glob += '.' + sourceExt;
    } else {
        testFilenames = spreadGlobs([glob]);
    }

    return {glob, isTestFile, testFilenames};
}


/**
 * spread the glob patterns
 * @param globs
 * @returns
 */
function spreadGlobs(globs: string[]) : string[] {
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