//对环境处理

//做Object.assign的兼容
if(typeof(Object.assign) != 'function'){
    Object.assign = function(targetObj){
        if(!targetObj){
            return null;
        }
        for(var i=1;i<arguments.length;i++){
            var tempObj = arguments[i];
            if(tempObj && typeof(tempObj) == 'object'){
                for(var key in tempObj){
                    targetObj[key] = tempObj[key];
                }
            }
        }
        return targetObj;
    }
}

//common工具类
var commonTools = {
    _options: {
        
    },

    //获取请求参数
    getRequestParam: function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r!=null)return  unescape(r[2]); return null;
    },

    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        return self;
    }
}
