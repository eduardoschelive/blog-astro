import type { ThemeRegistration } from 'shiki'

export const tokyoNightLight: ThemeRegistration = {
  name: 'tokyo-night-light',
  type: 'light',
  colors: {
    'editor.background': '#00000000',
    'editor.foreground': '#343b58',
    'editorLineNumber.foreground': '#6c6e75',
    'editorCursor.foreground': '#343b58',
    'editor.selectionBackground': '#d5d6db',
    'editor.lineHighlightBackground': '#dcdde3',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: {
        foreground: '#6c6e75',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier', 'keyword.control'],
      settings: {
        foreground: '#5a3e8e',
      },
    },
    {
      scope: [
        'keyword.operator',
        'keyword.operator.logical',
        'keyword.operator.comparison',
      ],
      settings: {
        foreground: '#5a3e8e',
      },
    },
    {
      scope: ['entity.name.function', 'support.function'],
      settings: {
        foreground: '#2959aa',
      },
    },
    {
      scope: ['variable', 'support.variable'],
      settings: {
        foreground: '#343b58',
      },
    },
    {
      scope: ['variable.parameter', 'meta.function.parameters'],
      settings: {
        foreground: '#8f5e15',
      },
    },
    {
      scope: ['string', 'punctuation.definition.string'],
      settings: {
        foreground: '#385f0d',
      },
    },
    {
      scope: ['constant.numeric', 'constant.language.boolean'],
      settings: {
        foreground: '#965027',
      },
    },
    {
      scope: ['constant.character', 'constant.other', 'support.constant'],
      settings: {
        foreground: '#965027',
      },
    },
    {
      scope: [
        'entity.name.type',
        'entity.name.class',
        'support.type',
        'support.class',
        'variable.other.class',
      ],
      settings: {
        foreground: '#343b58',
      },
    },
    {
      scope: ['entity.name.tag'],
      settings: {
        foreground: '#8c4351',
      },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: {
        foreground: '#5a3e8e',
      },
    },
    {
      scope: ['meta.property-name', 'support.type.property-name'],
      settings: {
        foreground: '#0f4b6e',
      },
    },
    {
      scope: ['punctuation', 'meta.brace', 'punctuation.definition'],
      settings: {
        foreground: '#343b58',
      },
    },
    {
      scope: ['entity.name.function.member', 'support.function.any-method'],
      settings: {
        foreground: '#0f4b6e',
      },
    },
    {
      scope: ['meta.object-literal.key', 'entity.name.function.ts'],
      settings: {
        foreground: '#33635c',
      },
    },
    {
      scope: ['support.class.component'],
      settings: {
        foreground: '#006c86',
      },
    },
    {
      scope: ['keyword.control.import', 'keyword.control.export'],
      settings: {
        foreground: '#0f4b6e',
      },
    },
    {
      scope: ['meta.embedded', 'source.groovy.embedded'],
      settings: {
        foreground: '#343b58',
      },
    },
    {
      scope: ['markup.heading'],
      settings: {
        foreground: '#2959aa',
        fontStyle: 'bold',
      },
    },
    {
      scope: ['markup.inline.raw', 'markup.fenced_code'],
      settings: {
        foreground: '#0f4b6e',
      },
    },
    {
      scope: ['markup.underline.link'],
      settings: {
        foreground: '#33635c',
      },
    },
    {
      scope: ['text.html.markdown'],
      settings: {
        foreground: '#40434f',
      },
    },
  ],
}
