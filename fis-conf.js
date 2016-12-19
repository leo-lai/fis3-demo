//通过set project.files对象指定需要编译的文件夹和引用的资源
// fis.set('project.files', ['page/**', 'map.json']);
// fis.set('project.static', '/static');

/*************************功能设置*****************************/
// 引入模块化开发插件，设置规范为 commonJs 规范。
fis.hook('commonjs', {
  // paths: {
  //   'jquery-weui': '/static/lib/jquery-weui/dist/js/jquery-weui.js'
  // },
  extList: ['.js', '.es']
});
fis.match('::package', {
  // 分析 __RESOURCE_MAP__ 结构，来解决资源加载问题
  postpackager: fis.plugin('loader', {
    resourceType: 'commonJs',
    useInlineMap: true // 资源映射表内嵌
  })
});

// 模块目录
fis.match('/{components, static/lib}/**.js', {
    isMod: true
  })
  .match('/page/main.js', {
    isMod: true
  })
  //可以引用短路径，比如/static/lib/jquery-weui/dist/js/jquery-weui.js
  //直接引用为var $ = require('jquery-weui');
  .match(/^\/static\/lib\/.*?([^/]+)\.js$/i, {
    id: '$1'
  })
  // require('jquery-weui.css');
  .match(/^\/static\/lib\/.*?([^/]+\.css)$/i, {
    id: '$1'
  });
// 压缩图片
fis.match('/static/images/**.png', {
  optimizer: fis.plugin('png-compressor', {
    type: 'pngquant'
  })
});
// 采用 babel 编译成 js 后缀的文件
fis.match('{*.{es,jsx},/{widget,page}/**.js}', {
  rExt: '.js',
  parser: fis.plugin('babel-5.x', {
    // blacklist: ['regenerator'],
    // optional: ['asyncToGenerator'],
    // stage: 3,
    sourceMaps: true
  })
});
// css自动添加前缀
fis.match('/{widget,page}/**.css', {
  postprocessor: fis.plugin('autoprefixer', {
    browsers: ['Android >= 2.1', 'iOS >= 4', 'ie >= 8', 'firefox >= 15'],
    cascade: true
  })
});

// 目录下同名依赖(index.html自动依赖index.js,index.css)
fis.match('/page/**.html', {
  useSameNameRequire: true
});


/*************************发布目录*****************************/
/*
  /page       页面目录
  /static     资源目录
*/
fis.match('/components/**', {
  release: '/static/$&'
});
/*************************打包规范*****************************/
/*
  js打包：第三方库(components, static/lib)js打包成base.js，项目组件(widget)js和main.js打包成common.js
  css打包：第三方库(components, static/lib)css打包成base.css，项目组件(widget)css和main.css打包成common.css
  页面独有的js，css可直接内联或单独文件，视文件大小而定
*/

// debug后缀 不会压缩
var map = {
  'prod': { // 本地产出发布
    host: '',
    path: ''
  },
  'prod-debug': {
    host: '',
    path: ''
  }
};

// 通用 1.替换url前缀 2.添加mr5码 3.打包 4.合图 5.重新定义资源路径
Object.keys(map).forEach(function(v) {
  var o = map[v];
  var domain = o.host + o.path;

  fis.media(v)
    .match('**.{es,js}', {
      useHash: true,
      domain: domain
    })
    .match('**.{scss,less,css}', {
      useSprite: true,
      useHash: true,
      domain: domain
    })
    .match('::image', {
      useHash: true,
      domain: domain
    })
    // 启用打包插件，必须匹配 ::package
    .match('::package', {
      packager: fis.plugin('map', {
        '/static/pkg/frame.css': [
          '/static/lib/jquery-weui/weui.css',
          '/static/lib/jquery-weui/jquery-weui.css'
        ],
        '/static/pkg/frame.js': [
          '/static/lib/fastclick/fastclick.js',
          '/static/lib/flexible/flexible.js',
          '/components/Vue/Vue.js',
          '/components/jquery/jquery.js',
          '/static/lib/jquery-weui/jquery-weui.js'
        ],
        '/static/pkg/common.css': [
          '/page/main.css',
          '/widget/**.css'
        ],
        '/static/pkg/common.js': [
          '/page/main.js',
          '/widget/**.js'
        ]
      }),
      spriter: fis.plugin('csssprites', {
        layout: 'matrix',
        scale: 0.5, // 移动端二倍图用
        margin: '10'
      })
    })
});


// 压缩css js html
Object.keys(map)
  .filter(function(v) {
    return v.indexOf('debug') < 0
  })
  .forEach(function(v) {
    fis.media(v)
      .match('**.html', {
        optimizer: fis.plugin('html-compress')
      })
      .match('**.{es,js}', {
        optimizer: fis.plugin('uglify-js')
      })
      .match('**.{scss,less,css}', {
        optimizer: fis.plugin('clean-css', {
          'keepBreaks': true //保持一个规则一个换行
        })
      });
  });

