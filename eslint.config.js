import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import astro from 'eslint-plugin-astro'
import prettier from 'eslint-config-prettier'

export default [
  { ignores: ['dist/', '.astro/', '.vercel/', 'public/search/'] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...astro.configs.recommended,
  {
    files: ['**/*.astro'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.astro'],
      },
    },
  },
  prettier,
  {
    rules: {
      // TypeScript and `astro check` own undefined-symbol resolution; the core
      // rule only produces false positives on types and platform globals.
      'no-undef': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      // Client `<script>` blocks are type-checked by `astro check`; ESLint's
      // script pass misreads TS generics (`el.querySelectorAll<T>(...)`) as
      // comparison statements, so this stylistic rule only misfires here.
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
]
