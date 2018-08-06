babel-plugin-for-zving-project
==============================

为了vue工程二次开发时可以覆盖原有的vue组件，将vue组件组织到zving命名空间下    
即将  
```export default obj```  
转换为下面这种写法  
```window.namespace('zving.dirname.filename')```  
```export default zving.dirname.filename = obj```  