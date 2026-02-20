import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import prompts from 'prompts';

export async function findWordPressRoot(startPath = process.cwd()) {
  let currentPath = startPath;

  while (currentPath !== path.parse(currentPath).root) {
    // Check for wp-config.php or wp-content directory
    if (
      fs.existsSync(path.join(currentPath, 'wp-config.php')) ||
      fs.existsSync(path.join(currentPath, 'wp-content'))
    ) {
      return currentPath;
    }
    currentPath = path.dirname(currentPath);
  }

  return null;
}

export async function getBlocksPath(customPath) {
  if (customPath) {
    // Use custom path if provided
    return path.resolve(customPath);
  }

  // Try to find WordPress root
  const wpRoot = await findWordPressRoot();
  
  if (wpRoot) {
    // Look for themes directory
    const themesPath = path.join(wpRoot, 'wp-content', 'themes');
    
    if (fs.existsSync(themesPath)) {
      const themes = fs.readdirSync(themesPath).filter(theme => {
        const themePath = path.join(themesPath, theme);
        return fs.statSync(themePath).isDirectory() && 
               !theme.startsWith('.') &&
               theme !== 'index.php';
      });

      if (themes.length === 1) {
        // Only one theme, use it
        return path.join(themesPath, themes[0], 'blocks');
      } else if (themes.length > 1) {
        // Multiple themes, ask user to choose
        const response = await prompts({
          type: 'select',
          name: 'theme',
          message: 'Select your theme:',
          choices: themes.map(theme => ({ title: theme, value: theme }))
        });

        if (response.theme) {
          return path.join(themesPath, response.theme, 'blocks');
        }
      }
    }
  }

  // Fallback: ask for path
  const response = await prompts({
    type: 'text',
    name: 'path',
    message: 'Enter the path to your blocks folder:',
    initial: './blocks'
  });

  if (!response.path) {
    throw new Error('No path provided');
  }

  return path.resolve(response.path);
}