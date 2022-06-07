import * as path from 'path';
import {ImportType} from './types/import_type';
import {ImportSource, ProcessedTsNode} from './types/processed_ts_node';
import {RawTsNode} from './types/raw_ts_node';

/**
 *
 * @param baseDirectory Scan target directory.
 * @param rawTsNode Original raw node.
 * @returns
 */
export const convertRawTsNodeToProcessedTsNode = (
  baseDirectory: string,
  rawTsNode: RawTsNode
): ProcessedTsNode => {
  const imports: {
    importType: ImportType;
    importSource: ImportSource;
  }[] = rawTsNode.imports.map(n => {
    return {
      importType: n.importType,
      importSource: processPathText(baseDirectory, rawTsNode.pathAbs, n.text),
    };
  });

  const filepathBasedOnTarget = path.relative(baseDirectory, rawTsNode.pathAbs);
  return {
    filepathBasedOnTarget,
    imports,
  };
};

const processPathText = (
  baseDirectory: string,
  filepath: string,
  pathText: string
): ImportSource => {
  if (pathText.startsWith('.')) {
    const abs = path.resolve(path.dirname(filepath), pathText + '.ts');
    return {type: 'path', path: path.relative(baseDirectory, abs)};
  }
  return {type: 'package', name: pathText};
};
