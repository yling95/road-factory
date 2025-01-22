import pluginVue from 'eslint-plugin-vue'
import vueTsEslintConfig from '@vue/eslint-config-typescript'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**'],
  },

  ...pluginVue.configs['flat/essential'],
  ...vueTsEslintConfig(),
  skipFormatting,
  {
    rules: {
      'vue/multi-word-component-names': 'off', // 禁用vue文件强制多个单词命名
      '@typescript-eslint/no-explicit-any': ['off'], //允许使用any
      '@typescript-eslint/ban-ts-comment': 'off', //允许使用@ts-ignore
      '@typescript-eslint/no-non-null-assertion': 'off', //允许使用非空断言
      'no-console': 'off', //不允许有分号
      semi: ['error', 'never'],
      'no-debugger': 'warn', //提交时不允许有debugger
      'no-unused-vars': 'off', //允许声明未使用变量
      'no-useless-escape': 'off', //允许使用转义字符
      'vue/no-side-effects-in-computed-properties': 'off', //允许在计算属性中有副作用
      'vue/attributes-order': 'off', //允许不按照顺序书写属性
      'vue/attribute-hyphenation': 'off', //允许不按照驼峰命名属性
      'vue/prefer-import-from-vue': 'off', //允许不使用vue引入
      '@typescript-eslint/ban-types': 'off', // 允许使用object
    },
  },
]
