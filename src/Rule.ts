export interface Rule {
    extension: string;
    testGlob: string;
    sourceGlob: string;
    sourceExt?: string;
}