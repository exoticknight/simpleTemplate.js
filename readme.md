#simpleTemplate.js

[![Build Status](https://travis-ci.org/exoticknight/simpleTemplate.js.svg?branch=master)](https://travis-ci.org/exoticknight/simpleTemplate.js) [![codecov.io](https://codecov.io/github/exoticknight/simpleTemplate.js/coverage.svg?branch=master)](https://codecov.io/github/exoticknight/simpleTemplate.js?ref=master)

简单易懂的字符串模板渲染方案。

无需依赖其他js库，适合轻量页面。

##通用API
* `fill({'field':'data'})` 填充数据
* `reset()` 重置数据
* `String render()` 渲染，返回渲染好的字符串
* `String version()` 输出当前Javascript脚本的版本

##基础示例（bare版功能）

模板使用前缀`{`和后缀`}`识别属于模板的内容。内容第一个字符使用`=`指示输出内容。

可以直接用字符串生成模板。

```javascript
// 生成模板
var template = simpleTemplate( '<p>{=text1}</p><p>{=text1}</p><p>{=text2}</p>' ),
    html;

// 填充数据
template.fill({
    'text1': '字符串1',
    'text2': '字符串2'
});

// 渲染
html = template.render();
// html = '<p>字符串1</p><p>字符串1</p><p>字符串2</p>';
```

也可以这样

```html
<script id="t_1" type="x-tmpl-simpleTemplate">
<p>{=text1}</p><p>{=text1}</p><p>{=text2}</p>
</script>

<script language="javascript">
// 生成模板
var template = simpleTemplate( document.getElementById( 't_1' ).innerHTML ),
    html;

// 填充数据
template.fill({
    'text1': '字符串1',
    'text2': '字符串2'
});

// 渲染
html = template.render();
// html = '<p>字符串1</p><p>字符串1</p><p>字符串2</p>';
</script>
```

渲染默认会对输出的内容作html escape处理，如果要输出原始字符串则使用`#`。

模板

```html
<p>{#html}</p>
```

数据

```javascript
{
    'html': '<hr>'
}
```

结果

```markup
<p><hr></p>
```

##进阶示例（normal版追加功能）

###多层数据

使用`.`分隔层级。

模板

```html
<p>{=people.0}</p>
<p>{=people.1.first} {=people.1.second}</p>
```

数据

```javascript
{
    'people': [
        'human',
        {'first': 'wein', 'second': 'lian'}
    ]
}
```

结果

```markup
<p>human</p>
<p>wein lian</p>
```

###判断

使用`!`指示判断，判断头需要指定数据域，判断尾则不需要。

模板

```html
<p>{=text}</p>
{!flag}
<p>{=text}</p>
{!}
```

数据

```javascript
{
    'flag': false,
    'text': '字符串'
}
```

结果

```markup
<p>字符串</p>
```

###列表

使用`>`标记列表头，需要指定数据域，使用`<`标记列表尾。（也可以理解为循环）

模板

```html
<ul>
{>list}
<li>
    {=*}-<i>{>list1} {=*.text} {<}</i>
</li>
{<}
</ul>
```

数据

```javascript
{
    'list': [1,2],
    'list1': [
        {'text': 'i'},
        {'text': 'love'},
        {'text': 'you'},
    ]
}
```

结果

```markup
<ul>
<li>
    1-<i> i  love  you </i>
</li>
<li>
    2-<i> i  love  you </i>
</li>
</ul>
```

###内嵌模板

使用`@`标记内嵌模板。

模板

```html
<p>{=text}</p>
<p>{@tmpl}</p>
```

数据

```javascript
{
    'text': 'outer',
    'innerText': 'inner',
    'tmpl': simpleTemplate( '{=innerText}' )
}
```

结果

```markup
<p>outer</p>
<p>inner</p>
```

##高阶示例（advanced版追加功能）

###内置过滤器

每一个能够指定数据域的地方，都能通过串联过滤器来对原始数据进行处理。

> 过滤器的操作不会修改原始数据。

过滤器使用'|'分隔，也可以将这里的'|'看成管道。

过滤器可以接受参数，隐含的第一个参数是上一个过滤器的结果。

模板

```html
<p>{ =text | first | append "| string " }</p>
```

数据

```javascript
{
    'text': 'outer'
}
```

结果

```markup
<p>o| string </p>
```

对数据域`text`的数据作为第一个参数传入内置过滤器`first`，结果是取出了字符串的第一个字符`o`。然后将这个字符作为第一个参数传入内置过滤器`append`，连同第二个参数`"| string "`也传入，结果是`o| string `。

显然如果字符串参数含有`|`或空格，则需要用双引号`"`括起来。

[内置过滤器列表](https://github.com/exoticknight/simpleTemplate.js/wiki/Filter)

过滤器功能的加入令判断功能更灵活。

> 过滤器的优先级比功能符号（=, #, !, >, <）高，也就是说，数据会先经过所有过滤器，才执行输出或者循环等操作。

模板

```html
{>numbers}
{!*|>= 2}
<p>{=*}</p>
{!}
{<}
```

数据

```javascript
{
    'numbers': [1,2,3]
}
```

结果

```markup
<p>2</p><p>3</p>
```

`{!*|>= 2}` 中，数据先经过 `>= 2` 这个过滤器，最后才是判断。

###自定义过滤器

你可以为每一个模板配置独立的自定义过滤器。

> 内置过滤器是所有模板都能使用的。

使用`filter( name, function )`来添加自定义过滤器。

形参中第一个参数是上一个过滤器的结果，函数最后返回处理后的结果。

> 当然你也可以不返回结果（下一个过滤器会得到undefined），不过这样没意义。

```javascript
template = simpleTemplate( '{=text|filter}' );
template.filter( 'filter', function( s ){
    return s + 'test';
});
```

###模板错误提示

advanced版中的模板语法比较复杂，容易出错，因此加入了模板错误提示，好让使用者发现模板问题所在。

模板

```html
{>list}{!bool}<p>{=*}</p>{<}{!}
```

结果（在控制台中查看）

```markup
[Level]
field

[Type]
unclosed flag

[Location]
1

[Message]
bool
```

以上很明显看出是标记还没结束之后就闭合了列表。

模板

```html
{>list}{!bool}<p>{=*||}</p>{!}{<}
```

结果（在控制台中查看）

```markup
[Level]
statement

[Type]
missing filter or data

[Location]
2

[Message]
in '*||'
```

以上是缺失了过滤器。

##历史

###bare v1.4 / normal v0.10.0 / advanced v0.4.0
    regular 更名为 normal
    重写 escapeHTML
    全部版本加入 Universal Module Definition 支持

###bare v1.2 / regular v0.9.4 / advanced v0.3
    在regular的基础上新增过滤器和错误提示功能，分化出advanced版
    全版本精简&规范了模板语法，包括：
    1. 判断尾'!'和列表尾'<'不再需要指定数据域
    2. 输出内容默认经过html escape，需要使用'='明确标记出
    3. 使用'#'标记则输出原始字符串

###bare v1.1 / regular v0.9
    全部版本增加HTML转义

###simpleTemplate.bare.js v1.0
    独立出只有简单数据填充功能的bare版，原版改为regular版

###0.8.4
    列表渲染标记又'@'和'-'修改为'>'和'<'
    增加内嵌模板的支持，渲染标记为'@'

###0.8
    抽出公共部分，改进函数调用

###0.6.1
    一些优化

###0.6
    因为解决IE678中split的bug要引入大量代码，所以直接更换了解析模板的过程

###0.5
    给循环加上了context支持，进化成列表

###0.4
    加入循环的支持

###v0.3
    加入判断（flag）的支持
    加入在模板中通过`.`读取数据的支持

###0.1
    第一个可用版本