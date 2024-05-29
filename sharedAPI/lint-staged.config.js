module.exports = {
  '*.{md,html}': ['prettier --write'],
  'src/**/*.{ts,tsx}': [
    // uncomment this to type-check the whole thing (there's no easy way to do it per-file)
    // we currently have way too many errors for this to work
    /*
      () => {
      return 'tsc --noEmit --skipLibCheck';
    }*/
    'eslint --fix',
    'prettier --write'
  ],
  'src/**/*.{js,jsx,json}': ['eslint --fix', 'prettier --write']
};
