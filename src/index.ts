import {Command} from 'commander';
import {exportMermaidJsGraph} from './use-cases/export-mermaid-js-graph';

const version = '1.0.0';

const program = new Command()
  .name('tsdm')
  .description('Generate typescript dependency graph.')
  .version(version);

program
  .command('mermaid')
  .description('Export graph as mermaid.js')
  .argument('<target>', 'root path of ts directory')
  .argument('<dest>', 'export destination')
  .option(
    '-d, --direction <string>',
    'mermaid graph direction. "TB" | "TD" | "BT" | "RL" | "LR"',
    'LR'
  )
  .action(
    (
      target: string,
      dest: string,
      options: {direction: 'TB' | 'TD' | 'BT' | 'RL' | 'LR'}
    ) => {
      exportMermaidJsGraph(target, dest, {direction: options.direction});
    }
  );

program.parse();
