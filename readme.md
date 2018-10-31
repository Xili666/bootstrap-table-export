# Bootstrap table export #

## bootstrapTableExport ##

|字段|名称|类型|解释|示例|
|:---|:--|:---|:---|:---|
|url|下载地址|`string`||`http://localhost:8080/download`|
|filename|文件名称|`string`|
|sheetname|表格名称|`string`|
|dialog|弹窗`div`对象|`object`||`$('#myModal')`|
|title|弹窗标题|`string`|
|fields|字段|`string`, `array`|

## 字段表 ##

|字段|名称|类型|解释|示例|
|:---|:--|:---|:---|:---|
|field|字段名|`string`||name|
|type| 类型|`string`| `string`(default), `number`, `date-(datetime|date|time|month|week)`|`date-date`|
|name| 中文名|`string`|| 名称|
|default|默认值|`string`||张三|
|select|选中|`boolean`|`true`-加入到list, `false`-加入到group, 默认`false`||
|search|查询条件|`json`||`{key1: "a", opt1: "lt", case: true, regex: false}`|

字段支持在html中固定

```json
fields: [{
    "field": "id",
    "name": "编号",
    "default": "",
    "select": true,
    "type": "number"
}, {
    "field": "name",
    "name": "姓名",
    "default": "0",
    "select": true,
    "type": "string"
}, {
    "field": "birth",
    "name": "生日",
    "default": "",
    "type": "date-month"
}]
```

也支持从后台传递到前台, 只需要满足json格式要求即可

```json
fields: 'http://localhost:8080/fields'
```