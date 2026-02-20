import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';
import { fileURLToPath } from 'url';
import { getBlocksPath, findWordPressRoot } from './utils.js';
import { getRegistry, getBlockInfo } from './registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function addBlock(blockName, options = {}) {
  const spinner = ora(`Adding ${blockName} block...`).start();

  try {
    // Get block info from registry
    const blockInfo = await getBlockInfo(blockName);
    if (!blockInfo) {
      spinner.fail(`Block "${blockName}" not found in registry`);
      return;
    }

    // Determine the blocks directory
    const blocksPath = await getBlocksPath(options.path);
    const blockPath = path.join(blocksPath, blockName);

    // Check if block already exists
    if (fs.existsSync(blockPath) && !options.overwrite) {
      spinner.fail(`Block "${blockName}" already exists. Use --overwrite to replace it.`);
      return;
    }

    // Create block directory
    await fs.ensureDir(blockPath);

    // Fetch and save each file
    const registry = await getRegistry();
    const { owner, repo, branch, path: repoPath } = registry.repository;

    for (const file of blockInfo.files) {
      const fileUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoPath}/${blockName}/${file}`;
      
      try {
        const response = await fetch(fileUrl, {
            headers: {
                'Authorization': `token ${process.env.GITHUB_TOKEN}`
            }
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch ${file}: ${response.statusText}`);
        }

        const content = await response.text();
        const filePath = path.join(blockPath, file);
        
        // Ensure directory exists for nested files
        await fs.ensureDir(path.dirname(filePath));
        
        // Write file
        await fs.writeFile(filePath, content);
        
      } catch (error) {
        spinner.fail(`Failed to fetch ${file}: ${error.message}`);
        // Clean up on failure
        await fs.remove(blockPath);
        return;
      }
    }

    spinner.succeed(chalk.green(`✓ Added ${blockName} block to ${blockPath}`));
    
    // Show next steps
    console.log('\n' + chalk.cyan('Next steps:'));
    console.log(chalk.gray(`1. Check the block in ${blockPath}`));
    console.log(chalk.gray(`2. Run npm install if the block has dependencies`));
    console.log(chalk.gray(`3. Build your blocks if using a build process`));

  } catch (error) {
    spinner.fail(`Failed to add ${blockName}: ${error.message}`);
    throw error;
  }
}