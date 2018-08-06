const types = require('babel-types')
const pathUtil = require('path')

/*
将
export default obj
转换为下面这种写法
window.namespace('zving.dirname.filename')
export default zving.dirname.filename = obj
*/

let visitor = {
  // export default 语句解析时触发该函数
  ExportDefaultDeclaration(path, ref = { opts: {} }) {  // path 语句抽象语法树 opts 插件参数
    const filePath = this.file.opts.sourceFileName.replace(/\\/g, '/')
    const include = new RegExp(ref.opts.include || 'src/(common|components|router|views)/')
    if (!include.test(filePath)) {
      return
    }
    let ns = ref.opts.namespace || 'zving'
    let modulePath = filePath.substr(filePath.indexOf('src/') + 4).replace(/\.\w+$/, '')
    modulePath = modulePath.replace(/[^\/\.\w]+(\w)/g, (a, b, c, d) => {
      return b.toUpperCase()
    })
    let moduleRefer = ns + '.' + modulePath.replace(/\//g, '.')

    let node = path.node
    let declaration = node.declaration
    let type = declaration.type // 导出对象，是一个Object或是一个 变量标识
    if (type === 'ObjectExpression' || type === 'Identifier') {
      // console.log('babel-plugin-zving:', moduleRefer, '引用组件', filePath)
      let callExpression = types.expressionStatement(
        types.callExpression(
          types.identifier('namespace'),
          [types.stringLiteral(moduleRefer)]
        )
      )
      let exportDeclaration = types.exportDefaultDeclaration(
        types.assignmentExpression(
          '=',
          buildMemberExprssion(moduleRefer),
          types.cloneDeep(declaration)
        )
      )
      // if(moduleRefer == 'zving.components.Position')
      // console.log(types.cloneDeep(declaration))
      // 将原有语句写法替换为新写法
      path.replaceWithMultiple([callExpression, exportDeclaration])
    }
  }
}
function buildMemberExprssion(ns) {
  ns = ns.split('.')
  const call = (ns) => {
    let s = ns.pop()
    if (!ns.length) {
      return types.identifier(s)
    } else {
      return types.memberExpression(call(ns), types.identifier(s), false)
    }
  }
  return call(ns)
}
module.exports = function (babel) { 
  return { visitor } 
}
