# swagger chrome extention
> 为了解决在swagger页面搜索困难的问题，催生了写这个插件的动机

## 安装方法
1. 压缩包解压到安装文件夹
2. 需要修改 manifest.json当中的 matches 域名为所需插件搜索的域名
3. chrome 菜单> 更多工具 > 扩展程序 
4. 打开开发者模式
5. 加载已解压的程序 

## 使用方法
![使用示意图](https://github.com/CC712/blog/blob/master/resource/img/swaggerEx.png)
## 核心搜索规则
目前只支持简单的文本匹配，默认不区分大小写。
```js
    function findInterface(kw) {
    let rtn = {
        key: kw,
        list: []
    };
    options.interfaces.forEach(it => {
        let text = it.val;
        let des = it.des;
        //关键词不区分大小写
        let reg = new RegExp(kw, "ig");
        if (text.match(reg) || des.match(reg)) {
            rtn.list.push(it);
        }
    });
    return rtn;
}
```
