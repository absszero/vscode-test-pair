import { basename } from 'path';

export interface FileComponent {
    filename: string,
    base: string,
    extension: string
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