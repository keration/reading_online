import configStandardScss from 'stylelint-config-standard-scss';
import configRecessOrder from 'stylelint-config-recess-order';
import configRecommendedVue from 'stylelint-config-recommended-vue/scss';
export default {
  extends: [
    configStandardScss,
    configRecessOrder,
    configRecommendedVue
  ],
  plugins: [
    'stylelint-order', // 属性排序插件
    'stylelint-scss' // SCSS 语法支持
  ],
  overrides: [
    {
      files: ['**/*.scss'],
      customSyntax: 'postcss-scss'
    },
    {
      files: ['**/*.vue'],
      customSyntax: 'postcss-html' // 新增 Vue 文件解析
    }
  ],
  rules: {
    // ========== 核心规则 ==========
    'color-no-invalid-hex': true,
    'function-no-unknown': null, // 禁用原生函数检查
    
    // ========== SCSS 专属规则 ==========
    'scss/at-rule-no-unknown': true, // 检查未知 @ 规则
    'scss/dollar-variable-pattern': null,
    'scss/operator-no-unspaced': true, // 运算符间距校验
    
    // ========== Vue 适配规则 ==========
    'selector-pseudo-class-no-unknown': [
      true,
      { 
        ignorePseudoClasses: [
          'deep',   // ::v-deep
          'slotted', // ::v-slotted
          'global'  // ::v-global
        ]
      }
    ],
    
    // ========== 属性排序规则 ==========
    'order/properties-order': [
      [
        // 布局属性
        'position', 'z-index', 'top', 'right', 'bottom', 'left',
        'display', 'flex-direction', 'flex-wrap', 'justify-content',
        'align-items', 'grid-template-columns',
        
        // 盒模型
        'width', 'min-width', 'max-width', 'height', 'min-height',
        'max-height', 'margin', 'margin-top', 'margin-right',
        'margin-bottom', 'margin-left', 'padding', 'padding-top',
        'padding-right', 'padding-bottom', 'padding-left',
        
        // 视觉样式
        'color', 'background', 'background-color', 'border',
        'border-radius', 'box-shadow', 'opacity'
      ],
      {
        unspecified: 'bottomAlphabetical', // 未列出的属性按字母排序
        emptyLineBefore: 'never'
      }
    ],
    
    // ========== 现代 CSS 支持 ==========
    'value-keyword-case': [
      'lower',
      {
        camelCaseSvgKeywords: true // 允许 SVG 属性驼峰命名
      }
    ],
    
    // ========== 嵌套规则限制 ==========
    'max-nesting-depth': [
      4, // 最大嵌套 4 层
      {
        ignore: ['blockless-at-rules']
      }
    ]
  },
  ignoreFiles: [
    '**/node_modules/**',
    '**/dist/**',
    '**/*.min.css'
  ]
}
  
  