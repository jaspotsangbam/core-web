import { Treeable } from '../treeable/shared/treeable.model';

/**
 * Model object for the FileAsset Object in dotCMS.
 */
export class File extends Treeable {
    inode: string;
    identifier: string;
    title: string;
    fileName: string;
    languageId: number;
    mimeType: string;
    modUserName: string;
    path: string;
    parent: string;
    constructor() {
        super();
        this.displayType = 'File';
    }
    // /**
    //  * Convenience method to check the mimetype and so if it starts with image
    //  * @returns boolean
    //  */
    // isImage(): boolean {
    //     return this.mimeType.startsWith('image');
    // }
}
