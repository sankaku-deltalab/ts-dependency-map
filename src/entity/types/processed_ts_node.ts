import {ImportType} from './import_type';

export type ImportSource =
  | {type: 'path'; path: string}
  | {type: 'package'; name: string};

/**
 * Processed dependency tree node of one ts file.
 *
 * Generated from `RawTsNode`.
 */
export type ProcessedTsNode = {
  filepathBasedOnTarget: string;
  imports: {
    importType: ImportType;
    importSource: ImportSource;
  }[];
};
