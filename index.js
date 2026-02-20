#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { addBlock } from './lib/add-block.js';
import { listBlocks } from './lib/registry.js';

const program = new Command();

program
  .name('your-wp-blocks')
  .description('CLI to add WordPress blocks to your project')
  .version('1.0.0');

program
  .command('add [blocks...]')
  .description('Add blocks to your project')
  .option('-p, --path <path>', 'Custom path to blocks folder', null)
  .option('-o, --overwrite', 'Overwrite existing blocks', false)
  .action(async (blocks, options) => {
    try {
      if (!blocks || blocks.length === 0) {
        console.log(chalk.yellow('Please specify which blocks to add'));
        console.log(chalk.gray('Example: npx your-wp-blocks add accordion card'));
        process.exit(1);
      }

      for (const block of blocks) {
        await addBlock(block, options);
      }
    } catch (error) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all available blocks')
  .action(async () => {
    await listBlocks();
  });

program.parse(process.argv);