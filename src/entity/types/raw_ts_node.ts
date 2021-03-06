import {ImportType} from './import_type';

/**
 * Dependency tree node of one ts file.
 */
export type RawTsNode = {
  pathAbs: string;
  imports: {
    importType: ImportType;
    text: string; // maybe contain rel path
  }[];
};
