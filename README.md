# Add a single block
npx shareable-wp-blocks-cli@latest add accordion

# Add multiple blocks
npx shareable-wp-blocks-cli@latest add accordion card hero

# Add with custom path
npx shareable-wp-blocks-cli@latest add accordion --path ./custom/blocks/path

# Overwrite existing blocks
npx shareable-wp-blocks-cli@latest add accordion --overwrite

# List available blocks
npx shareable-wp-blocks-cli@latest list

# In your CLI directory
npm link

# In your WordPress project
shareable-wp-blocks-cli add accordion