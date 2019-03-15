var server = {
    _options: {
        commonTools:  null,//公共工具对象（.commom.js提供）
        /* host: 'http://api.ecm-fans.com/v1.0/',//请求的根目录 */
        host: 'http://api.ecm-fans.com/Admin/',//请求的根目录

        //获取信息的api定义
        loginUrl: 'Login/login',//登录url
        getProductsListUrl: 'Product/index',//获取产品列表的url
        getUserInfoUrl: 'User/getUserInfo',//获取用户信息

        //栏目
        getCategorysListUrl: 'Category/getCategorys',//获取栏目类别的url（分级获取）
        getCategorysByConditionUrl: 'Category/getCategorysByCondition',//获取栏目列表（通过列表）
        saveCategoryUrl: 'Category/saveCategory',//保存栏目信息

        //碎片
        getFragmentsListUrl: 'Fragment/getFragments',//获取碎片列表
        saveFragmentUrl: 'Fragment/saveFragment',//保存碎片信息

        //文章列表
        getArticlesListUrl: 'Article/getArticles',//获取文章别表
        saveArticleUrl: 'Article/saveArticle',//保存产品信息
        remvoeArticleUrl: 'Article/removeArticle',//删除产品

        //产品
        getProductsListUrl: 'Product/getProducts',//获取产品列表
        saveProductUrl: 'Product/saveProduct',//保存产品信息
        remvoeProductUrl: 'Product/removeProduct',//删除产品

        //文件上传
        wangEditorFileServer: 'File/wangUpload',
        fileUploadServer: 'File/fileUpload'
    },
    _isHasInit: false,//是否初始化
    _ajaxNum: 0,//发起ajax个数


    //初始化数据
    initData: function(){
        var self = this;
        //检查是否已经初始化
        if(self._isHasInit){//只进行一次初始化
            return self;
        }else{
            self._isHasInit = true;
        }

    },

    getWangEditorFileUploadUrl: function(){
        var self = this;
        return self._options.host + self._options.wangEditorFileServer;
    },
    getFileUploadUrl: function(){
        var self = this;
        return self._options.host + self._options.fileUploadServer;
    },

    //登录
    login: function(data, callback){
        this.requestAndCallBack(data, this._options.loginUrl, callback, 'POST');
    },

    //获取用户信息
    getUserInfo: function(callback, beforeSendFunc){
        if(typeof beforeSendFunc === 'function'){
            beforeSendFunc();
        }
        this.requestAndCallBack(null, this._options.getUserInfoUrl, callback);
    },

    //获取栏目列表（层级关系获取）
    getCategorysList: function(callback){
        this.requestAndCallBack(null, this._options.getCategorysListUrl, callback);
    },
    //获取栏目别表（非层级）
    getCategorysByCondition: function(condition, callback){
        this.requestAndCallBack(condition, this._options.getCategorysByConditionUrl, callback);
    },
    //保存产品信息（包括编辑与新增）
    saveCategory: function(data, callback){
        this.requestAndCallBack(data, this._options.saveCategoryUrl, callback, 'post');  
    },
    
    //获取碎片列表
    getFragmentsList: function(callback){
        this.requestAndCallBack(null, this._options.getFragmentsListUrl, callback);
    },
    //保存碎片信息（包括编辑与新增）
    saveFragment: function(data, callback){
        this.requestAndCallBack(data, this._options.saveFragmentUrl, callback, 'post');  
    },
    
    //获取文章列表
    getArticlesList: function(condition, callback){
        this.requestAndCallBack(condition, this._options.getArticlesListUrl, callback);
    },
    //保存文章信息（包括编辑与新增）
    saveArticle: function(data, callback){
        this.requestAndCallBack(data, this._options.saveArticleUrl, callback, 'post');  
    },
    //移除文章
    removeArticle: function(articleId, callback){
        this.requestAndCallBack({articleId: articleId}, this._options.remvoeArticleUrl, callback);  
    },
    
    
    //获取产品类别
    getProductsList: function(condition, callback){
        this.requestAndCallBack(condition, this._options.getProductsListUrl, callback);
    },
    //保存产品信息（包括编辑与新增）
    saveProduct: function(data, callback){
        this.requestAndCallBack(data, this._options.saveProductUrl, callback, 'post');  
    },
    //移除产品
    removeProduct: function(productId, callback){
        this.requestAndCallBack({productId: productId}, this._options.remvoeProductUrl, callback);  
    },
    
    
    //请求并回调
    requestAndCallBack: function(sendData, url, callback, type){
        var self = this;
        var data = {};
        if(typeof sendData === 'object'){
            Object.assign(data, sendData);
        }else if (typeof sendData === 'string'){
            data = sendData;
        }
        type = type?type: 'get';//请求的方式
        //发送请求
        self.requestUrl({
            url: url,
            data: data,
            callback: function(result){
                callback(result);
            },
            type: type
        });
    },

    //统一请求（处理中英文）
    requestUrl: function(requestObj){
        // requestObj = {url, data, callback, type, isToken}
        var self = this;
        var type = requestObj.type;
        type = type?type: 'get';//请求的方式
        //发送请求
        $.ajax({
            data: requestObj.data,
            url: self._options.host + requestObj.url,
            type: type,
            crossDomain: true,
            xhrFields:{
                withCredentials: true
            },//携带身份验证
            success: function(data){
                if(typeof requestObj.callback === 'function'){
                    requestObj.callback(data);
                }
            },
            beforeSend: function(){
                var me = server;
                if(me._ajaxNum > 0){
                   $.showLoading();//显示加载数据 
                }else{
                    me._ajaxNum ++;
                    setTimeout(function(){
                        if(me._ajaxNum > 0){
                            $.showLoading();//显示加载数据 
                        }
                    }, 200);
                }
            },
            complete: function(){
                $.hideLoading();//隐藏加载数据 
                self._ajaxNum --;
            },
            error: function(XMLHttpRequest){
                console.log('网络错误！！！！');
            }
        });
    },

    //初始化方法
    init: function(options){
        var self = this;
        self.initData();
        return self;
    }
}

