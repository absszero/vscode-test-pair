import { Rule } from './Rule';
const minimatch = require("minimatch");
const FILENAME_PLACEHOLDER = '@@';

interface PairGlob {
    glob: string,
    isTestFile: string
}

/**
 * get pair glob
 * @param rule
 * @param fc
 * @returns
 */
export function getPairGlob(rule: Rule, fc: any): PairGlob {
    const isTestFile = minimatch(fc.filename, rule.testGlob.replace(FILENAME_PLACEHOLDER, '*'));
    let glob = rule.testGlob.replace(FILENAME_PLACEHOLDER, fc.base);
    if (isTestFile) {
        if (!rule.sourceGlob) {
            return {glob, isTestFile};
        }
        const filter = spreadGlobs(rule.sourceGlob.split(FILENAME_PLACEHOLDER));
        glob = fc.base;
        for (const part of filter) {
            glob = glob.split(part).join('');
        }
        let sourceExt = rule.sourceExt ?? rule.extension;
        glob += '.' + sourceExt;
    }

    return {glob, isTestFile};
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