import * as fs from 'fs';
import {join as joinPath, resolve as resolvePath} from 'path';
import * as glob from 'glob-promise';
import * as md5 from 'md5';
import {generateProcessedTsTree} from '../entity/generate-processed-ts-tree';
import type {ProcessedTsNode} from '../entity/types/processed_ts_node';

export type MermaidGraphOption = {
  direction: 'TB' | 'TD' | 'BT' | 'RL' | 'LR';
};

export const exportMermaidJsGraph = async (
  scanDirectory: string,
  dest: string,
  option: MermaidGraphOption
): Promise<void> => {
  const searchPattern = windowsPathToUnixPath(
    joinPath(scanDirectory, '**/*.ts')
  );
  const files = await glob.promise(searchPattern);
  const tree = generateProcessedTsTree(scanDirectory, files);
  const mermaidText = tsTreeToMermaidJsText(scanDirectory, tree, option);
  await fs.promises.writeFile(dest, mermaidText);
};

const windowsPathToUnixPath = (winPath: string): string => {
  return winPath.replace('C:\\', '/').split('\\').join('/');
};

const tsTreeToMermaidJsText = (
  scanDirectory: string,
  tree: ProcessedTsNode[],
  option: MermaidGraphOption
): string => {
  const splitNodePathList = tree.map(n => {
    return windowsPathToUnixPath(n.filepathBasedOnTarget).split('/');
  });
  const splitScanDir = windowsPathToUnixPath(resolvePath(scanDirectory)).split(
    '/'
  );
  const nodeCodes = [
    `subgraph ${splitScanDir[splitScanDir.length - 1]}`,
    ...genSubGraphNodeCodes(splitNodePathList).map(indent),
    'end',
  ];

  const edgeCodes = tree.flatMap(n => {
    const nodeFilePath = windowsPathToUnixPath(n.filepathBasedOnTarget);
    const nodeName = filePathToMermaidNodeName(nodeFilePath);
    return n.imports.map(im => {
      const destNodeName =
        im.importSource.type === 'package'
          ? im.importSource.name
          : filePathToMermaidNodeName(
              windowsPathToUnixPath(im.importSource.path)
            );
      const arrowText = im.importType === 'default' ? '-->' : '-.->';
      return `${nodeName} ${arrowText} ${destNodeName}`;
    });
  });
  const subCodes = [...nodeCodes, ...edgeCodes];
  return [`graph ${option.direction}`, ...subCodes.map(indent)].join('\n');
};

const filePathToMermaidNodeName = (filepath: string): string => {
  return md5(filepath);
};

const genSubGraphNodeCodes = (nodes: string[][], deps = 0): string[] => {
  const terminals = nodes.filter(n => n.length === deps + 1);
  const living = nodes.filter(n => n.length > deps + 1);
  const currentGraphs = unique(living.map(n => n[deps]));
  const subCodes = currentGraphs.flatMap(g => {
    const subNodes = living.filter(n => n[deps] === g);
    return [
      `subgraph ${g}`,
      ...genSubGraphNodeCodes(subNodes, deps + 1).map(indent),
      'end',
    ];
  });
  const terminalCodes = terminals.map(t => {
    const nodeTextRaw = t.join('/');
    const nodeName = filePathToMermaidNodeName(nodeTextRaw);
    const nodeTextShort = t[t.length - 1];
    return `${nodeName}[${nodeTextShort}]`;
  });
  return [...terminalCodes, ...subCodes];
};

const unique = <T>(vs: readonly T[]): T[] => {
  return [...new Set(vs).values()];
};

const indent = (s: string): string => `  ${s}`;
