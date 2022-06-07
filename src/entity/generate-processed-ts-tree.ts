import * as assert from 'assert';
import {resolve as resolvePath} from 'path';
import {createProgram, isImportDeclaration, isStringLiteral} from 'typescript';
import {convertRawTsNodeToProcessedTsNode} from './convert-raw-ts-node-to-processed-ts-node';
import {ImportType} from './types/import_type';
import {ProcessedTsNode} from './types/processed_ts_node';
import {RawTsNode} from './types/raw_ts_node';

export const generateProcessedTsTree = (
  targetDirectory: string,
  targetFilePaths: string[]
): ProcessedTsNode[] => {
  return targetFilePaths.map(t => {
    const rawNode = generateRawTsNodeFromFilePath(t);
    return convertRawTsNodeToProcessedTsNode(targetDirectory, rawNode);
  });
};

const generateRawTsNodeFromFilePath = (targetFilePath: string): RawTsNode => {
  const program = createProgram([targetFilePath], {});
  const sourceFile = program.getSourceFile(targetFilePath);
  assert(sourceFile !== undefined);
  const importNodes = sourceFile.statements.filter(isImportDeclaration);
  const imports: (
    | {
        importType: ImportType;
        text: string;
      }
    | undefined
  )[] = importNodes.map(n => {
    const typeOnly = n.importClause?.isTypeOnly ?? false;
    const importType = typeOnly ? 'typeOnly' : 'default';
    if (isStringLiteral(n.moduleSpecifier)) {
      return {importType, text: n.moduleSpecifier.text};
    }
    return undefined;
  });
  return {
    pathAbs: resolvePath(targetFilePath),
    imports: imports.filter(isNotUndefined),
  };
};

const isNotUndefined = <T>(v: T | undefined): v is T => v !== undefined;
