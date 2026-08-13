export default {
  '*.{ts,tsx}': ['eslint --max-warnings=0 --no-warn-ignored', 'prettier --write'],
  '*.{cjs,mjs,json,css,html,yml,yaml,md}': 'prettier --write',
};
