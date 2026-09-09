const lintStagedConfig = {
  '*.{cjs,cts,js,jsx,mjs,mts,ts,tsx}': ['eslint --fix --max-warnings=0', 'prettier --write'],
  '*.{css,json,md,yaml,yml}': 'prettier --write',
};

export default lintStagedConfig;
