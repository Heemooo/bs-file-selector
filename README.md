# bs-file-selector
A lightweight, non-dependent browser file selector,一个轻量无依赖的浏览器文件选择器

## 项目的由来
我们常常遇到一些接入第三方上传插件的场景，如WebUploader等，它们的功能通常都很完善，但是我们用不上所有功能，
且其UI的定制也不是太容易，更有甚者，如华为obs的接入，其仅提供了文件上传功能，其它的部分需要自己实现，基于此，
实现一个`轻量、无依赖、可自定义`的浏览器文件选择器。
## 项目的使用
### 简单demo
下载bs-file-selector，并在页面中引入,简易demo如下
```
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8">
		<title></title>
	</head>
	<input type="button" value="选择文件" id="btnId" />
	<script src="bs-file-selector.js"></script>
	<script>
		window.onload = function(){
		  var selector = new FileSelector({
		  	id: "btnId",//文件选择按钮id,id为btnId可不设置此项
		  	uploadFileType: ".zip",//文件类型
		  	uploadFileNumber: 1,//文件数量
		  	uploadFIleSize: "50mb",//文件大小
			showMsg: function(msg) {//不传入该回调方法默认使用alert
				alert(msg);
			},
		  	addElement: function(resourceFile) {
				//resourceFile文件对象
				console.log(resourceFile);
		  		var ui={};
				//ui代码
		  		resourceFile.bindUI(ui);
		  	}
		  });
		}
	</script>
	<body>
	</body>
</html>
```
### 自定义UI
在`addElement`回调方法的实现中你可以绑定自己的ui实现，调用`resourceFile.bindUI(ui);`绑定文件和UI，简单实现如下：
```
//TODO 为了方便，需要引入JQuery和Layui，也可以直接用原生实现ui
<!DOCTYPE html>
<html>
	<head>
		<meta charset="utf-8" />
		<title></title>
		<link rel="stylesheet" href="js/lib/layui/css/layui.css" />
	</head>
	<body>
		<div class="layui-container" style="margin-top: 50px;">
			<div>
				<button type="button" class="layui-btn" id="btnId">
					<i class="layui-icon">&#xe67c;</i>上传文件
				</button>
			</div>
			<table class="layui-table">
				<thead>
					<th>文件名</th>
					<th>大小</th>
					<th>进度</th>
					<th>备注</th>
				</thead>
				<tbody id="fileList">

				</tbody>
			</table>
		</div>
		<button type="button" class="layui-btn" id="startUpload">
			<i class="layui-icon">&#xe67c;</i>开始上传
		</button>
		<script src="bs-file-selector.js"></script>
		<script>
			$(document).ready(function() {
				var $tbody = $('#fileList');1
				var selector = new FileSelector({
					id: "btnId",
					uploadFileType: ".zip",
					uploadFileNumber: 1,
					uploadFileSize: 50 * 1024 * 1024,
					showMsg: function(msg) {
						alert(msg);
					},
					addElement: function(resourceFile) {
						var $tr = $("<tr></tr>");
						$("<td></td>").html(resourceFile.name).appendTo($tr);
						$("<td></td>").html(resourceFile.sizeText).appendTo($tr);
						//片段、进度
						var $partNumber = $("<p>当前进度:</p>");
						var $speed = $("<p>当前速度:</p>")
						//进度条
						var $progressBar = $("<div></div>").attr("class", "layui-progress-bar layui-bg-gree").css("width", "0%");
						var $progress = $("<div></div>").attr("class", "layui-progress layui-progress-big").append($progressBar);
						//url
						var $comleteUrl = $("<a target='_blank'></a>");
						$("<td></td>").append($partNumber).append($speed).append($progress).append($comleteUrl).appendTo($tr);

						var $del = $("<input class='layui-btn layui-btn-xs layui-btn-normal' type='button' value='X'>");
						$del.on("click", function() {
							$(this).parent().parent().remove();
							selector.deleteFile(resourceFile.uuid);
						});
						$("<td></td>").append($del).appendTo($tr);
						$tr.appendTo($tbody);
						var fileItem = new FileItem($partNumber, $speed, $progressBar, $comleteUrl, resourceFile.size);
						resourceFile.bindUI(fileItem);
					}
				});
				var FileItem = function($partNumber, $speed, $progressBar, $comleteUrl, fileSize) {
					this.$partNumber = $partNumber;
					this.$speed = $speed;
					this.$progressBar = $progressBar;
					this.$comleteUrl = $comleteUrl;
					this.uploadedSize = 0;
					this.fileSize = fileSize;
				}
				FileItem.prototype.updateProgress = function(partNumber, speed, value) {
					if (this.$partNumber) this.$partNumber.html("当前进度:正在上传分片" + partNumber);
					if (this.$speed) this.$speed.html("当前速度:" + speed + "/S");
					var percent = (this.uploadedSize + value) * 100.0 / this.fileSize;
					if (this.$progressBar) this.$progressBar.attr("style", "width:" + percent + "%");
				}
				FileItem.prototype.updateUrl = function(url) {
					if (this.$partNumber) this.$partNumber.html("当前进度:上传成功");
					if (this.$comleteUrl) {
						this.$comleteUrl.attr("href", url);
						this.$comleteUrl.html("Link:" + url);
					}
				};
				FileItem.prototype.setUploadedSize = function(value) {
					if (this.uploadedSize) this.uploadedSize += value;
					else this.uploadedSize = value;
					return this.uploadedSize;
				}
				FileItem.prototype.setCompleteInfo = function(info) {
					if (this.$partNumber) this.$partNumber.html("当前进度:" + info);
				}
				$("#startUpload").click(function() {
					var files = selector.getFiles();
					if (files) {
						files.forEach(function(value, key) {
							if (!value.isUploaded) {
								//TODO 开始上传
							}
						});
					}
				});
			});
		</script>
	</body>
</html>
```
### 获取文件
调用`selector.getFiles()`可以获取文件列表
### API
#### FileSelector
- array getFiles()			获取文件列表
- ResourceFile delete(uuid) 删除文件，返回被删除文件对象
#### ResourceFile
- 基础属性如下：
	```
	file:文件对象
	isUploaded:是否已上传
	name:文件名
	size:文件大小(byte)
	sizeText:文件大小
	suffix:文件后缀
	type:文件类型
	ui:文件绑定的ui对象
	uuid:自动生成的36位uuid
	```
- void bindUI(obj)			绑定UI对象
- boolean uploaded(isUploaded)	设置文件上传状态或获取文件上传状态