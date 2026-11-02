import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import pluginReact from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier/flat'

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url))

export default defineConfig([
	includeIgnoreFile(gitignorePath),
	{
		extends: ['js/recommended'],
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
		plugins: { js },
	},
	{
		files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
		languageOptions: { globals: globals.browser },
	},
	tseslint.configs.recommended,
	{
		...pluginReact.configs.flat.recommended,
		settings: {
			react: {
				version: 'detect',
			},
		},
	},
	pluginReact.configs.flat['jsx-runtime'],
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.mjs', '**/*.js'],
		rules: {
			'no-undef': 'off',
		},
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					args: 'all',
					argsIgnorePattern: '^_',
					caughtErrors: 'all',
					caughtErrorsIgnorePattern: '^_',
					destructuredArrayIgnorePattern: '^_',
					ignoreRestSiblings: true,
					varsIgnorePattern: '^_',
				},
			],
			'react/prop-types': 'off',
		},
	},
	reactHooks.configs['recommended-latest'],
	eslintConfigPrettier,
])
