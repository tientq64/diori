module.exports = {
	root: true,
	env: { browser: true, es2020: true },
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
		'plugin:react-hooks/recommended'
	],
	ignorePatterns: ['node_modules', 'dist', 'misc', '.eslintrc.cjs'],
	parser: '@typescript-eslint/parser',
	plugins: ['react-refresh'],
	rules: {
		'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
		'react-hooks/rules-of-hooks': 'off',
		'react-hooks/exhaustive-deps': 'warn',
		'@typescript-eslint/no-unused-vars': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'no-extra-semi': 'off',
		'no-constant-condition': 'warn',
		'no-useless-rename': 'error',
		'no-new-wrappers': 'error',
		'object-shorthand': 'error'
	}
}
