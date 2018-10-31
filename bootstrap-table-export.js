;
(function ($) {
    "use strict";

    // 构造函数
    var BootstrapTableExport = function (el, options) {
        this.$el = $(el);
        this.$options = options;
        this.init();
    };

    // 默认参数
    BootstrapTableExport.DEFAULTS = {
        url: '',
        css: "btn btn-default",
        dialog: undefined,
        title: '',
        filename: '',
        sheetname: '',
        fields: [],
        search: [],
        method: "POST", // GET
        persist: "none" // 持久化到none, server, client
    };

    // 初始化方法
    BootstrapTableExport.prototype.init = function () {
        this.initStyle();
        this.initDialog();
        this.initEvent();
    };

    // 初始化页面===========================================

    // 初始化样式
    BootstrapTableExport.prototype.initStyle = function () {
        this.$el.addClass(this.$options.css);
    };

    // 初始化弹窗
    BootstrapTableExport.prototype.initDialog = function () {
        this.$dialog = this.$options.dialog;
        this.$dialog.addClass("modal fade");
        this.$dialog.attr({
            tabindex: -1,
            role: "dialog",
            "aria-labelledby": "bootStrapExportModal",
            "aria-hidden": true
        });
        var html = [];
        html.push('<div class="modal-dialog bootstrap-table-export-modal-dialog">');
        html.push('  <div class="modal-content">');
        html.push('    <div class="modal-header">');
        html.push('      <button type="button" class="close" data-dismiss="modal" aria-hidden="true">');
        html.push('        &times;');
        html.push('      </button>');
        html.push('      <h4 class="modal-title" id="bootStrapExportModal">' + this.$options.title + '</h4>');
        html.push('    </div>');
        html.push('    <div class="modal-body">');
        html.push('      <div id="bootstrap-table-export-center">');
        html.push('        <ul class="list-group">');
        html.push('          <li class="list-group-item" id="bootstrap-table-export-li-header">');
        html.push('            <div>');
        html.push('              <span class="bootstrap-table-export-span-field">代码</span>');
        html.push('              <span class="bootstrap-table-export-span-name">名称</span>');
        html.push('              <span class="bootstrap-table-export-span-default">默认值</span>');
        html.push('              <span class="bootstrap-table-export-span-search">查询条件</span>');
        html.push('              <span class="bootstrap-table-export-span-edit">操作</span>');
        html.push('            </div>');
        html.push('          </li>');
        html.push('        </ul>');
        html.push('      </div>');
        html.push('      <div id="bootstrap-table-export-bottom"></div>');
        html.push('    <div class="modal-footer">');
        html.push('      <button id="bootstrap-table-export-submit" type="button" class="btn btn-primary">');
        html.push('        导出');
        html.push('      </button>');
        html.push('    </div>');
        html.push('  </div>');
        html.push('</div>');
        html.push('<div id="bootstrap-table-export-hidden-form"></div>');

        this.$dialog.html(html.join(''));
        var fieldArray = this.$options.fields;
        if (typeof this.$options.fields == "string") {
            fieldArray = this.getFieldsArray(this.$options.fields);
        }
        var that = this;
        $.each(fieldArray, function (i, field) {
            if (field.field !== undefined) {
                if (field.select == true) {
                    var li = [];
                    li.push('          <li id="bootstrap-table-export-li-' + field.field + '" class="list-group-item bootstrap-table-export-li" draggable="true" data-field-type="' +
                        that.getFieldType(field.type) + '" data-field-search=\'' + (field.search == undefined ? "" : field.search) + '\'>');
                    li.push('            <div>');
                    li.push('              <span class="bootstrap-table-export-span-field">' + field.field + '</span>');
                    li.push('              <span class="bootstrap-table-export-span-name">' + (field.name === undefined ? field.field : field.name) + '</span>');
                    li.push('              <span class="bootstrap-table-export-span-default">' + (field.default === undefined ? '' : field.default) + '</span>');
                    if (field.search !== undefined && field.search !== '') {
                        li.push('              <span class="bootstrap-table-export-span-search">' + that.buildSearchText(that.getFieldType(field.type), JSON.parse(field.search)) + '</span>');
                    } else {
                        li.push('              <span class="bootstrap-table-export-span-search"></span>');
                    }
                    li.push('              <span class="bootstrap-table-export-span-edit"><a>编辑</a></span>');
                    li.push('            </div>');
                    li.push('          </li>');
                    $('#bootstrap-table-export-center ul').append(li.join(''));
                } else {
                    var btn = $('<button class="btn btn-default bootstrap-table-export-btn-option" draggable="true"></button>')
                        .text((field.name === undefined ? field.field : field.name))
                        .attr('data-field-field', field.field)
                        .attr('data-field-name', (field.name === undefined ? field.field : field.name))
                        .attr('data-field-default', (field.default == undefined ? "" : field.default))
                        .attr('data-field-type', (field.type == undefined ? "string" : field.type))
                        .attr('data-field-search', (field.search == undefined ? "" : field.search))
                    $('#bootstrap-table-export-bottom').append(btn);
                }
            }
        });

        if ($('#bootstrap-table-export-bottom').children().length === 0) {
            this.addBottomHint();
        }

        // 初始化编辑弹窗
        this.initEditDialog();
    };

    // 初始化字段修改操作框
    BootstrapTableExport.prototype.initEditDialog = function () {
        var html = [];
        html.push('<div id="bootstrap-table-export-edit-dialog" class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="bootstrapExportEditDialog" aria-hidden="true">');
        html.push('	<div class="modal-dialog">');
        html.push('		<div class="modal-content">');
        html.push('			<div class="modal-header">');
        html.push('				<button type="button" class="close" data-dismiss="modal" aria-hidden="true">');
        html.push('					&times;');
        html.push('				</button>');
        html.push('				<h4 class="modal-title" id="bootstrapExportEditDialog">');
        html.push('				</h4>');
        html.push('			</div>');
        html.push('			<div class="modal-body">');
        html.push('			</div>');
        html.push('			<div class="modal-footer">');
        html.push('				<button type="button" class="btn btn-default" data-dismiss="modal">关闭');
        html.push('				</button>');
        html.push('				<button type="button" id="bootstrap-table-export-edit-dialog-submit" class="btn btn-primary">');
        html.push('					确认');
        html.push('				</button>');
        html.push('			</div>');
        html.push('		</div>');
        html.push('	</div>');
        html.push('</div>');
        this.$dialog.after(html.join(''));
    }

    // 初始化事件
    BootstrapTableExport.prototype.initEvent = function () {
        var that = this;
        // 显示弹窗
        this.$el.click(() => {
            this.showDialog();
        });

        // 全选取消全选
        $('#bootstrap-table-export-select-all').click(() => {
            this.toggleAll($('#bootstrap-table-export-select-all').is(":checked"));
        });

        // 选中候选项
        this.initBtnClickEvent();

        // 提交
        $('#bootstrap-table-export-submit').click(() => {
            this.submit();
        });

        // 初始化列表拖放事件
        this.initLiDragDropEvent();

        // 初始化候选按钮拖放事件
        this.initBtnDragDropEvent();

        // 初始化底部候选栏拖放事件
        this.initBottomDragDropEvent();

        // 初始化列表编辑按钮点击事件
        this.initLiEditEvent();
    };

    // 列表编辑按钮点击事件
    BootstrapTableExport.prototype.initLiEditEvent = function ($a) {
        $a = $a || $('.bootstrap-table-export-li a');
        var that = this;
        $a.on('click', function () {
            that.showEditDialog();
        });
    }

    // 显示字段修改操作框
    BootstrapTableExport.prototype.showEditDialog = function () {
        var $dialog = $('#bootstrap-table-export-edit-dialog');
        var $li = $(event.target).parents("li");
        var rowData = this.getLiRowData($li);
        var $btn = $dialog.find('#bootstrap-table-export-edit-dialog-submit');
        // 设置标题
        $dialog.find('h4').text(rowData.name);
        if (rowData.type == 'string') {
            this.fullStringEditDialog($dialog);
            this.setStringEditDialogData($dialog, $li.attr('data-field-search'));
            this.initStringEditDialogSubmitEvent($dialog, $btn, $li);
        } else if (rowData.type == 'number') {
            this.fullNumberEditDialog($dialog);
            this.setNumberEditDialogData($dialog, $li.attr('data-field-search'));
            this.initNumberEditDialogSubmitEvent($dialog, $btn, $li);
        } else if (rowData.type.match('^date-(datetime|date|time|month|week)$')) {
            this.fullDateEditDialog($dialog, this.getDateType(rowData.type));
            this.setDateEditDialogData($dialog, $li.attr('data-field-search'));
            this.initDateEditDialogSubmitEvent($dialog, $btn, $li);
        } else {
            this.fullStringEditDialog($dialog);
            this.setStringEditDialogData($dialog, $li.attr('data-field-search'));
            this.initStringEditDialogSubmitEvent($dialog, $btn, $li);
        }
        $dialog.find("#default").val(rowData.default);
        $dialog.modal("show");
    }

    // 获取时间控件的格式
    BootstrapTableExport.prototype.getDateType = function (str) {
        var type = "datetime-local";
        var t = str.substr(5);
        if (t == 'datetime') {
            return type;
        } else {
            return t;
        }
    }

    // 设置string类型的编辑操作界面
    BootstrapTableExport.prototype.fullStringEditDialog = function ($dialog) {
        var $modal = $dialog.find(".modal-body");
        var html = [];
        html.push('<form class="form-horizontal" role="form">');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">默认值</label>');
        html.push('        <div class="col-sm-8">');
        html.push('            <input type="text" class="form-control" id="default" name="default" placeholder="请输入默认值">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <hr>');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">查找条件</label>');
        html.push('        <div class="col-sm-8">');
        html.push('            <input type="text" class="form-control" id="key1" name="key1" placeholder="请输入关键字">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <div class="form-group">');
        html.push('        <div class="col-sm-offset-2 col-sm-3">');
        html.push('            <div class="checkbox">');
        html.push('                <label>');
        html.push('                    <input type="checkbox" id="case" name="case">区分大小写');
        html.push('                </label>');
        html.push('            </div>');
        html.push('        </div>');
        html.push('        <div class="col-sm-3">');
        html.push('            <div class="checkbox">');
        html.push('                <label>');
        html.push('                    <input type="checkbox" id="regex" name="regex">正则表单式');
        html.push('                </label>');
        html.push('            </div>');
        html.push('        </div>');
        html.push('    </div>');
        html.push('</form>');
        $modal.html(html.join(''));
    }

    // 设置number类型的编辑操作界面
    BootstrapTableExport.prototype.fullNumberEditDialog = function ($dialog) {
        var $modal = $dialog.find(".modal-body");
        var html = [];
        html.push('<form class="form-horizontal" role="form">');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">默认值</label>');
        html.push('        <div class="col-sm-8">');
        html.push('            <input type="number" class="form-control" id="default" placeholder="请输入默认值">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <hr>');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">查找条件</label>');
        html.push('        <div class="col-sm-3">');
        html.push('            <select id="opt1" class="form-control">');
        html.push('                <option value="lt">&lt;</option>');
        html.push('                <option value="le">&le;</option>');
        html.push('                <option value="eq">&equals;</option>');
        html.push('                <option value="ge">&ge;</option>');
        html.push('                <option value="gt">&gt;</option>');
        html.push('            </select>');
        html.push('        </div>');
        html.push('        <div class="col-sm-5">');
        html.push('            <input type="number" class="form-control" id="key1" placeholder="请输入关键字">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">查找条件</label>');
        html.push('        <div class="col-sm-3">');
        html.push('            <select id="opt2" class="form-control">');
        html.push('                <option value="lt">&lt;</option>');
        html.push('                <option value="le">&le;</option>');
        html.push('                <option value="eq">&equals;</option>');
        html.push('                <option value="ge">&ge;</option>');
        html.push('                <option value="gt">&gt;</option>');
        html.push('            </select>');
        html.push('        </div>');
        html.push('        <div class="col-sm-5">');
        html.push('            <input type="number" class="form-control" id="key2" placeholder="请输入关键字">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('</form>');
        $modal.html(html.join(''));
    }

    // 设置date类型的编辑操作界面
    BootstrapTableExport.prototype.fullDateEditDialog = function ($dialog, type) {
        var $modal = $dialog.find(".modal-body");
        var html = [];
        html.push('<form class="form-horizontal" role="form">');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">默认值</label>');
        html.push('        <div class="col-sm-8">');
        html.push('            <input type="' + type + '" class="form-control" id="default" placeholder="请输入默认值">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <hr>');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">查找条件</label>');
        html.push('        <div class="col-sm-3">');
        html.push('            <select id="opt1" class="form-control">');
        html.push('                <option value="lt">&lt;</option>');
        html.push('                <option value="le">&le;</option>');
        html.push('                <option value="eq">&equals;</option>');
        html.push('                <option value="ge">&ge;</option>');
        html.push('                <option value="gt">&gt;</option>');
        html.push('            </select>');
        html.push('        </div>');
        html.push('        <div class="col-sm-5">');
        html.push('            <input type="' + type + '" class="form-control" id="key1" placeholder="请输入日期">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('    <div class="form-group">');
        html.push('        <label for="default" class="col-sm-2 control-label">查找条件</label>');
        html.push('        <div class="col-sm-3">');
        html.push('            <select id="opt2" class="form-control">');
        html.push('                <option value="lt">&lt;</option>');
        html.push('                <option value="le">&le;</option>');
        html.push('                <option value="eq">&equals;</option>');
        html.push('                <option value="ge">&ge;</option>');
        html.push('                <option value="gt">&gt;</option>');
        html.push('            </select>');
        html.push('        </div>');
        html.push('        <div class="col-sm-5">');
        html.push('            <input type="' + type + '" class="form-control" id="key2" placeholder="请输入日期">');
        html.push('        </div>');
        html.push('    </div>');
        html.push('</form>');
        $modal.html(html.join(''));
    }

    // 初始化string类型的编辑操作界面提交按钮点击事件
    BootstrapTableExport.prototype.initStringEditDialogSubmitEvent = function ($dialog, $btn, $li) {
        $btn.off('click').on('click', () => {
            $li.find('.bootstrap-table-export-span-default').text($dialog.find('#default').val());
            var json = {};
            json['key1'] = $dialog.find('#key1').val();
            json['case'] = $dialog.find('#case').is(':checked');
            json['regex'] = $dialog.find('#regex').is(':checked');
            $li.attr('data-field-search', JSON.stringify(json));
            $li.find('.bootstrap-table-export-span-search').text(this.buildSearchText("string", json));
            $dialog.modal("hide");
        });
    }

    // 初始化number类型的编辑操作界面提交按钮点击事件
    BootstrapTableExport.prototype.initNumberEditDialogSubmitEvent = function ($dialog, $btn, $li) {
        $btn.off('click').on('click', () => {
            $li.find('.bootstrap-table-export-span-default').text($dialog.find('#default').val());
            var json = {};
            json['key1'] = $dialog.find('#key1').val();
            json['opt1'] = $dialog.find('#opt1').val();
            json['key2'] = $dialog.find('#key2').val();
            json['opt2'] = $dialog.find('#opt2').val();
            $li.attr('data-field-search', JSON.stringify(json));
            $li.find('.bootstrap-table-export-span-search').text(this.buildSearchText("number", json));
            $dialog.modal("hide");
        });
    }

    // 初始化date类型的编辑操作界面提交按钮点击事件
    BootstrapTableExport.prototype.initDateEditDialogSubmitEvent = function ($dialog, $btn, $li) {
        $btn.off('click').on('click', () => {
            $li.find('.bootstrap-table-export-span-default').text($dialog.find('#default').val());
            var json = {};
            json['key1'] = $dialog.find('#key1').val();
            json['opt1'] = $dialog.find('#opt1').val();
            json['key2'] = $dialog.find('#key2').val();
            json['opt2'] = $dialog.find('#opt2').val();
            $li.attr('data-field-search', JSON.stringify(json));
            $li.find('.bootstrap-table-export-span-search').text(this.buildSearchText("date", json));
            $dialog.modal("hide");
        });
    }

    // 设置string查询的条件
    BootstrapTableExport.prototype.setStringEditDialogData = function ($dialog, search) {
        if (undefined !== search && '' != search) {
            var json = JSON.parse(search);
            $dialog.find('#key1').val(json.key1);
            $dialog.find('#case').prop("checked", json.case);
            $dialog.find('#regex').prop("checked", json.regex);
        }
    }

    // 设置number查询的条件
    BootstrapTableExport.prototype.setNumberEditDialogData = function ($dialog, search) {
        if (undefined !== search && '' != search) {
            var json = JSON.parse(search);
            $dialog.find('#key1').val(json.key1);
            $dialog.find('#opt1').val(json.opt1);
            $dialog.find('#key2').val(json.key2);
            $dialog.find('#opt2').val(json.opt2);
        }
    }

    // 设置date查询的条件
    BootstrapTableExport.prototype.setDateEditDialogData = function ($dialog, search) {
        if (undefined !== search && '' != search) {
            var json = JSON.parse(search);
            $dialog.find('#key1').val(json.key1);
            $dialog.find('#opt1').val(json.opt1);
            $dialog.find('#key2').val(json.key2);
            $dialog.find('#opt2').val(json.opt2);
        }
    }

    // 候选按钮点击事件
    BootstrapTableExport.prototype.initBtnClickEvent = function ($btn) {
        var that = this;
        $btn = $btn || $('.bootstrap-table-export-btn-option');
        $btn.on('click', function () {
            that.checkOption($(this));
            if ($('#bootstrap-table-export-bottom').children().length === 0) {
                that.addBottomHint();
            }
        });
    };

    // 列表拖放事件
    BootstrapTableExport.prototype.initLiDragDropEvent = function ($li) {
        var that = this;
        $li = $li || $('.bootstrap-table-export-li, #bootstrap-table-export-li-header');
        $li.on('dragstart', function (event) {
            that.dragLiStart(event);
        });

        $li.on('dragover', function (event) {
            that.allowDrop(event);
        });

        $li.on('drop', function (event) {
            that.dropLi(event);
        });
    };

    BootstrapTableExport.prototype.dragLiStart = function () {
        event.dataTransfer.setData("li", $(event.target).attr("id"));
    };

    BootstrapTableExport.prototype.dropLi = function () {
        event.preventDefault();
        var id = event.dataTransfer.getData("li");
        if (id !== undefined && id != '') { // 列表拖动
            $(event.target).parents('li').after($('#' + id));
        } else { // 待选按钮拖进列表
            var field = event.dataTransfer.getData("btn");
            if (field !== undefined && field != '') {
                var $btn = $('[data-field-field=' + field + ']');
                var btnData = this.getBtnData($btn);
                var li = [];
                li.push('          <li id="bootstrap-table-export-li-' + btnData.field + '" class="list-group-item bootstrap-table-export-li" draggable="true" data-field-type="' +
                    this.getFieldType(btnData.type) + '" data-field-search=\'' + (btnData.search == undefined ? "" : btnData.search) + '\'>');
                li.push('            <div>');
                li.push('              <span class="bootstrap-table-export-span-field">' + btnData.field + '</span>');
                li.push('              <span class="bootstrap-table-export-span-name">' + (btnData.name === undefined ? btnData.field : btnData.name) + '</span>');
                li.push('              <span class="bootstrap-table-export-span-default">' + (btnData.default === undefined ? '' : btnData.default) + '</span>');
                if (btnData.search !== undefined && btnData.search != '') {
                    li.push('              <span class="bootstrap-table-export-span-search">' + this.buildSearchText(this.getFieldType(btnData.type), JSON.parse(btnData.search)) + '</span>');
                } else {
                    li.push('              <span class="bootstrap-table-export-span-search"></span>');
                }
                li.push('              <span class="bootstrap-table-export-span-edit"><a>编辑</a></span>');
                li.push('            </div>');
                li.push('          </li>');
                var $li = $(li.join(''));
                $(event.target).parents('li').after($li);

                if ($('#bootstrap-table-export-center').find($li).length > 0) {
                    // 从候选栏删除按钮
                    this.removeOption($btn);
                }
                // 更新拖放事件
                this.initLiDragDropEvent($li);
                // 更新编辑按钮点击事件
                this.initLiEditEvent($li.find('a'));
            }
        }
    };

    // 按钮拖放事件
    BootstrapTableExport.prototype.initBtnDragDropEvent = function ($btn) {
        var that = this;
        $btn = $btn || $('.bootstrap-table-export-btn-option');
        $btn.on('dragstart', function (event) {
            that.dragBtnStart(event);
        });
    };

    BootstrapTableExport.prototype.dragBtnStart = function () {
        event.dataTransfer.setData("btn", $(event.target).attr("data-field-field"));
    };

    // 底部候选栏拖放事件
    BootstrapTableExport.prototype.initBottomDragDropEvent = function () {
        var that = this;
        var $bottom = $('#bootstrap-table-export-bottom');
        $bottom.on('dragover', function (event) {
            that.allowDrop(event);
        });

        $bottom.on('drop', function (event) {
            that.dropBottom(event);
        });
    };

    // 底部候选栏放置事件
    BootstrapTableExport.prototype.dropBottom = function (event) {
        event.originalEvent.preventDefault();
        var id = event.originalEvent.dataTransfer.getData("li");
        if (id !== undefined && id != '') { // 列表拖进待选项
            var $li = $('#' + id);
            var rowData = this.getLiRowData($li);
            var btn = $('<button class="btn btn-default bootstrap-table-export-btn-option" draggable="true"></button>')
                .text((rowData.name === undefined ? rowData.field : rowData.name))
                .attr('data-field-field', rowData.field)
                .attr('data-field-name', rowData.name)
                .attr('data-field-default', rowData.default)
                .attr('data-field-type', rowData.type)
                .attr('data-field-search', rowData.search);
            this.addOption(btn);
            $li.remove();
            // 更新按钮拖放事件
            this.initBtnDragDropEvent(btn);
            this.initBtnClickEvent(btn);
        } else { // 待选按钮拖动
            var field = event.originalEvent.dataTransfer.getData("btn");
            if (field !== undefined && field != '') {
                $('#bootstrap-table-export-bottom').append($('[data-field-field=' + field + ']'));
            }
        }
    };

    // 允许拖动
    BootstrapTableExport.prototype.allowDrop = function () {
        event.preventDefault();
    };

    // 获取列表行数据
    BootstrapTableExport.prototype.getLiRowData = function ($li) {
        var _field = $li.find('.bootstrap-table-export-span-field').text();
        var _name = $li.find('.bootstrap-table-export-span-name').text();
        var _default = $li.find('.bootstrap-table-export-span-default').text();
        var _type = $li.attr("data-field-type");
        var _search = $li.attr("data-field-search");
        return {
            field: _field,
            name: _name,
            default: _default,
            type: _type,
            search: _search
        };
    };

    // 获取待选按钮的数据
    BootstrapTableExport.prototype.getBtnData = function ($btn) {
        return {
            field: $btn.attr('data-field-field'),
            name: $btn.attr('data-field-name'),
            default: $btn.attr('data-field-default'),
            type: $btn.attr('data-field-type'),
            search: $btn.attr('data-field-search')
        };
    };

    // 从候选框移除候选按钮
    BootstrapTableExport.prototype.removeOption = function ($btn) {
        $btn.remove();
        if ($('#bootstrap-table-export-bottom').children().length === 0) {
            this.addBottomHint();
        }
    };

    // 添加候选按钮到候选框
    BootstrapTableExport.prototype.addOption = function ($btn) {
        if ($('#bootstrap-table-export-bottom button').length === 0) {
            $('#bootstrap-table-export-bottom').html($btn);
        } else {
            $('#bootstrap-table-export-bottom').append($btn);
        }
    };

    // 候选框添加提示
    BootstrapTableExport.prototype.addBottomHint = function () {
        $('#bootstrap-table-export-bottom').append($('<span class="bootstrap-table-export-bottom-span-hint">将不需要的字段拖到这里...</span>'));
    };

    // 显示弹窗
    BootstrapTableExport.prototype.showDialog = function () {
        this.$dialog.modal('show');
    };

    // 选中候选项
    BootstrapTableExport.prototype.checkOption = function ($btn) {
        var btnData = this.getBtnData($btn);
        var li = [];
        li.push('          <li id="bootstrap-table-export-li-' + btnData.field + '" class="list-group-item bootstrap-table-export-li" draggable="true" data-field-type="' +
            this.getFieldType(btnData.type) + '" data-field-search=\'' + (btnData.search == undefined ? "" : btnData.search) + '\'>');
        li.push('            <div>');
        li.push('              <span class="bootstrap-table-export-span-field">' + btnData.field + '</span>');
        li.push('              <span class="bootstrap-table-export-span-name">' + (btnData.name === undefined ? btnData.field : btnData.name) + '</span>');
        li.push('              <span class="bootstrap-table-export-span-default">' + (btnData.default === undefined ? '' : btnData.default) + '</span>');
        if (btnData.search !== undefined && btnData.search != '') {
            li.push('              <span class="bootstrap-table-export-span-search">' + this.buildSearchText(this.getFieldType(btnData.type), JSON.parse(btnData.search)) + '</span>');
        } else {
            li.push('              <span class="bootstrap-table-export-span-search"></span>');
        }
        li.push('              <span class="bootstrap-table-export-span-edit"><a>编辑</a></span>');
        li.push('            </div>');
        li.push('          </li>');
        var $li = $(li.join(''));
        $('#bootstrap-table-export-center ul').append($li);

        if ($('#bootstrap-table-export-center').find($li).length > 0) {
            // 从候选栏删除按钮
            this.removeOption($btn);
        }
        // 更新拖放事件
        this.initLiDragDropEvent($li);
        // 更新编辑按钮点击事件
        this.initLiEditEvent($li.find('a'));
    };

    // 汇总表单数据
    BootstrapTableExport.prototype.createJsonData = function () {
        var that = this;
        var array = [];
        var $lis = $('.bootstrap-table-export-li');
        $.each($lis, function (i, li) {
            // 加入每行的数据
            array.push(that.getLiRowData($(li)));
        });
        return JSON.stringify(array);
    };

    // 提交请求到服务器
    BootstrapTableExport.prototype.submit = function (event) {
        var data = {};
        data['filename'] = this.$options.filename;
        data['sheetname'] = this.$options.sheetname;
        data['persist'] = this.$options.persist;
        data['fields'] = this.createJsonData();
        var formHtml = [];
        formHtml.push('<form action=' + this.$options.url + ' method=' + this.$options.method + '>');
        $.each(data, function (k, v) {
            formHtml.push('<input type="hidden" name=\'' + k + '\' value=\'' + v + '\'/>');
        });
        formHtml.push('</form>');
        $('#bootstrap-table-export-hidden-form').html(formHtml.join(''));
        $('#bootstrap-table-export-hidden-form > form').submit().remove();
    };

    // 构建获取工具方法========================================================

    // 从url获取fields列表
    BootstrapTableExport.prototype.getFieldsArray = function (url) {
        var array = [];
        $.ajax({
            url: url,
            type: 'get',
            async: false,
            dataType: "json",
            success: function (json) {
                array = json;
            }
        });
        $.each(array, function (i, obj) {
            var type = obj['type'];
            if (type != undefined && type.match('^date-(datetime|date|time|month|week)$')) {
                if (obj['default'] != undefined) {
                    if (type == "date-datetime") {
                        var dateStr = obj['default'].split(" ");
                        var strGMT = dateStr[0] + " " + dateStr[1] + " " + dateStr[2] + " " + dateStr[5] + " " + dateStr[3] + " GMT+0800";
                        var date = new Date(Date.parse(strGMT));
                        obj['default'] = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + "T" + date.getHours() + ':' + date.getMinutes();
                    }
                }
            }
        });
        return array;
    }

    // 获取字段类型
    BootstrapTableExport.prototype.getFieldType = function (type) {
        return type == undefined ? "string" : type;
    }

    // 构建查询条件显示语句
    BootstrapTableExport.prototype.buildSearchText = function (type, json) {
        var text = [];
        if (json != undefined) {
            if (type.match('^date') || "number" == type) {
                if (json.key1 != "") {
                    text.push(this.symbolTransform(json.opt1));
                    text.push(" ");
                    text.push(json.key1);
                    text.push(" ");
                }
                if (json.key2 != "") {
                    text.push(this.symbolTransform(json.opt2));
                    text.push(" ");
                    text.push(json.key2);
                }
            } else if ("string" == type) {
                text.push(json.key1);
                text.push(' ');
                text.push(json.case ? '/i' : '');
                text.push(json.regex ? '/g' : '');
            }
        }
        return text.join('');
    }

    // 符号转换
    BootstrapTableExport.prototype.symbolTransform = function (sym) {
        switch (sym) {
            case 'lt':
                return "<";
            case 'le':
                return "≤";
            case 'eq':
                return "=";
            case 'ge':
                return "≥";
            case 'gt':
                return ">";
        }
    }

    // 允许方法
    var allowedMethods = [];

    // 入口函数
    $.fn.bootstrapTableExport = function (option) {
        var value,
            args = Array.prototype.slice.call(arguments, 1);
        this.each(function () {
            var $this = $(this),
                data = $this.data('bootstrap.table.export'),
                options = $.extend({}, BootstrapTableExport.DEFAULTS, $this.data(),
                    typeof option === 'object' && option);

            if (typeof option === 'string') {
                if ($.inArray(option, allowedMethods) < 0) {
                    throw new Error("Unknown method: " + option);
                }

                if (!data) {
                    return;
                }

                value = data[option].apply(data, args);

                if (option === 'destroy') {
                    $this.removeData('bootstrap.table.export');
                }
            }

            if (!data) {
                $this.data('bootstrap.table.export', (data = new BootstrapTableExport(this, options)));
            }
        });

        return typeof value === 'undefined' ? this : value;
    };

    $.fn.bootstrapTableExport.Constructor = BootstrapTableExport;
    $.fn.bootstrapTableExport.defaults = BootstrapTableExport.DEFAULTS;
})(jQuery);