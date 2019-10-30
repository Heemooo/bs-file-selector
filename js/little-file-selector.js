//TODO 1.sha256:https://www.cnblogs.com/loveyunk/p/7513902.html
//TODO 2.完善渲染表格
;
(function(global) {
	"use strict";
	var ResourceFile = function(file) {
		this.file = file;
		this.name = file.name;
		this.suffix = (function(fileName) {
			if (fileName) {
				return "." + fileName.substring(fileName.lastIndexOf(".") + 1, fileName.length);
			}
		})(file.name);
		this.uuid = (function(len, radix) {
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
		})(0, 36);
		this.size = file.size;
		this.sizeText = (function(fileByte) {
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
		})(file.size);
		this.isUploaded = false;
		this.progress = undefined;
	}
	ResourceFile.prototype.uploaded = function(uploaded) {
		if (uploaded) this.isUploaded = uploaded;
		return this.isUploaded;
	}
	var defaultOption = {
		el: "btnId",
		initTable: undefined,
		addElement: undefined
	}

	function LittleFileSelector(options) {
		this.options = Object.assign(defaultOption, options);
		this.files = new Map();
		var btn = document.getElementById(this.options.el);
		var self = this;
		(function init() {
			var filetor = document.createElement("input");
			filetor.setAttribute("type", "file");
			filetor.setAttribute("style", "display:none");
			filetor.onchange = function() {
				addFile(this.files[0]);
			}
			btn.onclick=function(){
				console.log();
				filetor.click();
			}
			document.body.appendChild(filetor);
			/* if (self.options.initTable && typeof self.options.initTable === "function") {
				self.options.initTable(container);
			} */
		})();
		var addFile = function(file) {
			var resourceFile = new ResourceFile(file);
			self.files.set(resourceFile.uuid, resourceFile);
			self.options.addElement(resourceFile);
		};
		return this;
	}
	LittleFileSelector.prototype.getFiles = function() {
		return this.files;
	}
	LittleFileSelector.prototype.deleteFile = function(uuid) {
		return this.files.delete(uuid);
	}
	if (typeof module !== 'undefined' && module.exports) {
		//兼容CommonJs规范 
		module.exports = LittleFileSelector;
	} else if (typeof define === 'function') {
		//兼容AMD/CMD规范
		define(function() {
			return LittleFileSelector
		})
	} else {
		//注册全局变量，兼容直接使用script标签引入插件
		global.LittleFileSelector = LittleFileSelector;
	}
})(this);
