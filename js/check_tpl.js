	function CheckTempl(option){
		 deepCopy(option,this);
		 this.Binding=function(){
			var self=this;
			self.SourceArea.on("keyup",function(){
				self.ApplyKeyup();
			}).on("keydown",self.ApplyTab)
			return self;
		}
	}

	function deepCopy(source,target){
		for(var key in source){
			if(typeof key === "object"){
				deepCopy(source[key],target);
			}else if(!target[key]){
				target[key]=source[key];
			}
		}
	}
	
	CheckTempl.prototype.ApplyKeyup=function(){
		var code=this.format(); 
		var data=this.check(code); 
		if(this.Success){
			var decode=this.parse(code);
			this.TargetArea.val(decode);
			this.ResultArea.val(this.ResultArea.val()+"\r\n"+decode.toString());
		}else{ 
			var temp=code.substring(0,this.Error.at-2)+"~~~~"+code.substring(this.Error.at);
			this.TargetArea.val(temp);
		}
	}
	CheckTempl.prototype.ApplyTab=function(e){
		if (e.keyCode == 9) {
	        e.preventDefault();
	        var indent = '    ';
	        var start = this.selectionStart;
	        var end = this.selectionEnd;
	        var selected = window.getSelection().toString();
	        selected = indent + selected.replace(/\n/g, '\n' + indent);
	        this.value = this.value.substring(0, start) + selected
	                + this.value.substring(end);
	        this.setSelectionRange(start + indent.length, start
	                + selected.length);
	    }
	}
	CheckTempl.prototype.format=function(){
		return this.SourceArea.val();
	}
	CheckTempl.prototype.check=function(code){ 
		return this.tryParseJson(code); 
	}
	CheckTempl.prototype.parse=function (template) {
		var __list__ = [];
		var that=this;
		var current="";
		try {
			return eval("(function(){return function(Model){var _$_ = [],model=Model;" + ("$>" + template.trim() + "<$").replace(/<\$\s*=\s*([\s\S]*?)\s*\$>/g, function (a, b) {
				return "<$ _$_.push(" +that.xss(b) + "); $>";
			}).replace(/<\$\s*\-\s*([\s\S]*?)\s*\$>/g, function (a, b) {
				return "<$ _$_.push(" + b + "); $>";
			}).replace(/\$>([\s\S]*?)<\$/g, function (a, b) {
				current=b;

				if (/^\s*$/.test(b))
					return "";
				else
					return "_$_.push(__list__[" + (__list__.push(b) - 1) + "]);";
			}) + "return _$_.join('');}})()"); 
		} catch (e) {
			this.ResultArea.val("\r\n Error :"+e);
			this.ResultArea.val("\r\n Location:"+current); 
			return function(){}
		}
	}
	CheckTempl.prototype.xss=function(str){
	    return str && (typeof str === "string") ? str.replace(/[<>&"]/g, function(target){
	        return {
	        	"&": "&amp;",
	            "<": "&lt;",
	            ">": "&gt;",
	            "\"": "&quot;"
	        }[target];
	    }) : str;
	}
	CheckTempl.prototype.tryParseJson=function(code){
		var data = code.replace(/(\n[\t ]+)"content"\s*:\s*(\{([\s\S]+?)\1\})/g, function(all, space, value, content){
			return all.replace(value, "\"" + content.replace(/[\r\n\t]/g, " ").replace(/\\/g, "\\\\").replace(/"/g, "\\\"") + "\"");
		});
			var result={};
			try{
	  		result=json_parse(data);
	  		this.ResultArea.val("验证成功！");
	  		this.Success=true;
			}catch(e){ 
			this.Success=false;
			this.Error=e;
			this.ResultArea.val("解析模板失败! 描述：位置:"+(e.at-1)+" "+e.message.replace("Expected","希望为：").replace("instead of"," 但是当前为：")+" \r\n解析字符串:"+e.text);
			}
		console.log(result); 
		return result;
	};