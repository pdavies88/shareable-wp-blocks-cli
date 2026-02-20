import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function getRegistry() {
  const registryPath = path.join(path.dirname(__dirname), 'blocks.json');
  return await fs.readJson(registryPath);
}

export async function getBlockInfo(blockName) {
  const registry = await getRegistry();
  return registry.blocks.find(block => block.name === blockName);
}

export async function listBlocks() {
  const registry = await getRegistry();
  
  console.log(chalk.cyan('\nAvailable blocks:\n'));
  
  registry.blocks.forEach(block => {
    console.log(chalk.yellow(`  ${block.name}`) + chalk.gray(` - ${block.description}`));
  });
  
  console.log('\n' + chalk.gray('Run: npx your-wp-blocks add [block-name] to add a block'));
}