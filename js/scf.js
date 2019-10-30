var SCF = (function() {
	var maxSize;
	var fileTypes;

	function ResourceFile() {
		this.file = undefined;
		this.uploaded = false;
		this.progress = undefined;
		this.suffix = undefined;
		this.uuid = undefined;
		this.completeUrl = undefined;
		this.partNumber = undefined;
		this.speed = undefined;
	}
	ResourceFile.prototype.updateProgress = function(value) {
		if (this.progress) this.progress.attr("style", "width:"+value+"%");
	}
	ResourceFile.prototype.updateUrl = function(url, value) {
		if (this.completeUrl) {
			this.completeUrl.attr("href", "value");
			this.completeUrl.html(value);
		}
	}
	ResourceFile.prototype.updatePartNumber = function(partNumber) {
		if (this.partNumber) this.partNumber.html("当前进度:正在上传分片" + partNumber);
	}
	ResourceFile.prototype.updateSpeed = function(speed) {
		if (this.speed) this.speed.html("当前速度:" + SCF.getFileSize(speed) + "KB/S");
	}
	var $inputFile, $container, $tbody;
	var files = new Map();
	var renderTable = function() {
		var $table = $("<table></table>").attr("class", "layui-table");
		$(
			"<thead>" +
			"<th style='width:40%'>文件名</th><th style='width:10%'>大小</th>" +
			"<th style='width:40%'>备注</th><th style='width:10%'>删除</th>" +
			"</thead>"
		).appendTo($table);
		$tbody = $("<tbody></tbody").appendTo($table);
		$table.appendTo($container);
	}
	var addFile = function(file) {
		if (!file) {
			return;
		}
		var fileSuffix = SCF.getFileSuffix(file.name);
		if (file.size > maxSize) {
			clearInputFile();
			alert("上传限制：文件大小不能超过" + SCF.getFileSize(maxSize));
			return;
		}
		if (fileTypes.indexOf(fileSuffix) < 0) {
			clearInputFile();
			alert("文件格式不符合要求！");
			return;
		}

		var $tr = $("<tr></tr>");
		$("<td></td>").html(file.name).appendTo($tr);
		$("<td></td>").html(SCF.getFileSize(file.size)).appendTo($tr);
		//片段、进度
		var $partNumber = $("<p>当前进度:</p>");
		var $speed = $("<p>当前速度:</p>")
		//进度条
		var $progressBar = $("<div></div>").attr("class", "layui-progress-bar layui-bg-gree").css("width", "0%");
		var $progress = $("<div></div>").attr("class", "layui-progress layui-progress-big").append($progressBar);
		//url
		var $comleteUrl = $("<a></a>");
		$("<td></td>").append($partNumber).append($speed).append($progress).append($comleteUrl).appendTo($tr);

		var $del = $("<input type='button' value='X'>");
		$del.on("click", function() {
			$(this).parent().parent().remove();
			files.delete(file.name);
		});
		$("<td></td>").append($del).appendTo($tr);
		$tr.appendTo($tbody);
		var resourceFile = new ResourceFile();
		resourceFile.file = file;
		resourceFile.suffix = fileSuffix;
		resourceFile.uuid = SCF.getUUid(0,36);
		resourceFile.uploaded = false;
		resourceFile.partNumber = $partNumber;
		resourceFile.speed = $speed;
		resourceFile.progress = $progressBar;
		resourceFile.completeUrl = $comleteUrl;
		files.set(file.name, resourceFile);
		clearInputFile();
	}
	//获得文件后缀，有(.)
	var getFileSuffix = function(fileName) {
		if (fileName) {
			return "." + fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
		}
	}
	var clearInputFile = function() {
		$inputFile.val("");
	}
	return {
		renderUI: function(option) {
			$container = $("#" + option.container);
			if (option.maxSize) maxSize = option.maxSize;
			$inputFile = $("<input type='file' id='SCFSelector'>");
			$inputFile[0].onchange = function() {
				addFile(this.files[0]);
			}
			$container.append($inputFile);
			if (option.fileTypes) {
				fileTypes = option.fileTypes;
				$inputFile.attr("accept", fileTypes);
			}
			renderTable();
		},
		files: function() {
			return files;
		},
		file: function() {
			return inputFile;
		}, //获得uuid
		getUUid: function(len, radix) {
			var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
			var uuid = [],
				i;
			radix = radix || chars.length;
			if (len) {
				// Compact form
				for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
			} else {
				// rfc4122, version 4 form
				var r;
				// rfc4122 requires these characters
				uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
				uuid[14] = '4';
				// Fill in random data.  At i==19 set the high bits of clock sequence as
				// per rfc4122, sec. 4.1.5
				for (i = 0; i < 36; i++) {
					if (!uuid[i]) {
						r = 0 | Math.random() * 16;
						uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
					}
				}
			}
			return uuid.join('');
		},

		//获得文件后缀，有(.)
		getFileSuffix: function(fileName) {
			if (fileName) {
				return "." + fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
			}
		},
		getFileSize: function(fileByte) {
			var fileSizeByte = fileByte;
			var fileSizeMsg = "";
			if (fileSizeByte < 1048576) fileSizeMsg = (fileSizeByte / 1024).toFixed(2) + "KB";
			else if (fileSizeByte == 1048576) fileSizeMsg = "1MB";
			else if (fileSizeByte > 1048576 && fileSizeByte < 1073741824) fileSizeMsg = (fileSizeByte / (1024 * 1024)).toFixed(
				2) + "MB";
			else if (fileSizeByte > 1048576 && fileSizeByte == 1073741824) fileSizeMsg = "1GB";
			else if (fileSizeByte > 1073741824 && fileSizeByte < 1099511627776) fileSizeMsg = (fileSizeByte / (1024 * 1024 *
				1024)).toFixed(2) + "GB";
			else fileSizeMsg = "文件超过1TB";
			return fileSizeMsg;
		}
	}
})();
