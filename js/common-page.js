/* 页面公共类 */
var commonPage = {
    _options: {
        server: null,//服务类（从 ./server.js中导入）
        wangEditor: null,//富文本编辑（使用new创建实例）
        
        //容器
        pageContianerSelector: '.container',//页面的容器的选择器

        //左侧
        leftNavContainerSelector: '.left-nav-ul',//左侧导航条的容器
        leftNavContentAreaSelector: '.left-side',//左侧导航的内容区域
        leftNavActiveClass: 'nav-active',//导航被选中的class
        leftNavClassList: [
            'index',
            'categorys',
            'fragments',
            'articles',
            'products'
        ],//栏目使用的class

        //右侧
        rigthContentAreaSelector: '.right-side',//右侧
        rightContentContainerSelector: '.right-content-area',//右侧内容区域
        rigthContentAreaMarkSelector: '.right-content-area-mask',//右侧内容区域遮罩
        rightContentTplContainerSelector: '.js-right-content-area-tpl',//右侧内容区域的模板容器

        //头部分
        userInfoSelector: '.js-full-userinfo',//头部分用户信息

        //WebUploader
        webUploader: null,//WebUploader对象
        webUploaderSwf: './assets/webuploader/Uploader.swf',
    },

    server: null,//使用的服务类
    E: null,//使用的富文本编辑器
    wangEditorFileServer: '',//wangEditor文件服务器
    webUploader: null,//webUploader对象
    fileUploadServer: '',//一般文件上传的服务器
    webUploaderDoingNum: 0,//正在初始化的webUploader个数
    _isHasInit: false,//是否已经初始化
    isloadNum: 0,//正在加载的个数（在启动异步时候+1， 在异步回调时候-1）

    //使用的公共变量
    _urlRe: /(.*?#)(.*)$/,//获取hash值以及替代hash变量的正则表达式

    //dom的jquery对象
    $leftObj: null,//左侧对象
    $rightObj: null,//右侧对象


    //使用的数据
    data: {},//使用的数据

    _initData: function(){
        var self = this;
        //检查是否已经初始化
        if(self._isHasInit){//只进行一次初始化
            return self;
        }else{
            self._isHasInit = true;
        }
        
        //对服务类初始化
        var _server = self._options.server;
        if(typeof _server !== 'object' || _server === null){
            _server = server.init();//赋值给服务类
        }
        self.server = _server;

        var _wangEditor = self._options.wangEditor;
        if(typeof _server !== 'object' || _server === null){
            _wangEditor = window.wangEditor;//赋值给服务类
        }
        self.E = _wangEditor;
        self.wangEditorFileServer = server.getWangEditorFileUploadUrl();//设置wangEditor文件服务器
        //补充wangEditor全屏功能
        self.E.fullscreen = {// editor create之后调用
            init: function(editorSelector){
                $(editorSelector + " .w-e-toolbar").append('<div class="w-e-menu"><a class="_wangEditor_btn_fullscreen" onclick="window.wangEditor.fullscreen.toggleFullscreen(\'' + editorSelector + '\')">全屏</a></div>');
            },
            toggleFullscreen: function(editorSelector){
                $(editorSelector).toggleClass('fullscreen-editor');
                if($(editorSelector + ' ._wangEditor_btn_fullscreen').text() == '全屏'){
                    $(editorSelector + ' ._wangEditor_btn_fullscreen').text('退出全屏');
                }else{
                    $(editorSelector + ' ._wangEditor_btn_fullscreen').text('全屏');
                }
            }
        };
        
        var _webUploader = self._options.webUploader;
        if(typeof _webUploader !== 'object' || _webUploader === null){
            _webUploader = WebUploader;//赋值给服务类
        }
        self.webUploader = _webUploader;
        self.fileUploadServer = server.getFileUploadUrl();//设置一般文件上传

        self.$page = $(self._options.pageContianerSelector);//页面容器对象
        self.$leftObj = $(self._options.leftNavContentAreaSelector);//左侧对象
        self.$rightObj = $(self._options.rigthContentAreaSelector);//右侧对象

        
        //获取用户信息（并且检查是否登录）
        self.isloadNum ++;
        self.server.getUserInfo(function(res){
            $.hideLoading();//隐藏加载数据
            self.isloadNum --;
            if(res.status === 0){//还没有登录
                swal({
                    title: '登录提醒',
                    text: res.message,
                    type: 'error',
                    timer: 1000
                }, function(){
                    window.location.href = './login.html';
                });
            }else{
                self.data['userInfo'] = res.data;
                self.$page.find(self._options.userInfoSelector).html('欢迎您，' + self.data.userInfo.nickname);
                self.$page.show();//显示页面
                self.isloadNum ++;
                //获取栏目信息
                self.server.getCategorysByCondition({},function(res){
                    self.isloadNum --;
                    if(res.status === 1){
                        self.data['categorys'] = res.data;
                    }
                });
                self.isloadNum ++;
                //获取碎片数据
                self.server.getFragmentsList(function(res){
                    self.isloadNum --;
                    if(res.status === 1){
                        var fragments = res.data;
                        self.data['fragments'] = fragments;
                        var key_fragments = {};
                        for(var i=0, item = null;i<fragments.length;i++){
                            item = fragments[i];
                            key_fragments[item.key] = item;
                        }
                        self.data['key_fragments'] = key_fragments;
                    }
                });
                
            }
        },function(){
            self.$page.hide();//隐藏所有的页面
            $.showLoading();//显示加载数据
        });

        return self;
    },

    //初始化事件
    _initEven: function(){
        var self = this;

        //左侧导航的点击事件
        self.$leftObj.find(self._options.leftNavContainerSelector).off('click').on('click', 'li',function(){
            var $this = $(this);
            var navActive = self._options.leftNavActiveClass;
            if($this.hasClass(navActive)){
                return;
            }else{
                self.hideContentAreaMark();//关闭遮罩层

                var className = $this.prop("className");
                $this.addClass(navActive).siblings('li').removeClass(navActive);
                //修改地址栏
                var url = window.location.href
                if(self._urlRe.test(url)){
                    url = url.replace(self._urlRe, '$1' + className);
                }else{
                    url += '#' + className;
                }
                window.location.href = url;

                //对左侧菜单选中，对右侧内容加载
                var contentTplHtml = './tpl/' + className + '.tpl.html';
                var startTplFuncName = className + 'TplObj';
                self.isloadNum ++;
                setTimeout(function(){
                    var me = commonPage;
                    if(me.isloadNum > 0){
                        $.showLoading();//加载数据
                    }
                }, 500);
                self.$rightObj.find(self._options.rightContentContainerSelector).load(contentTplHtml, function(){
                    self[startTplFuncName].init(null, function(){
                        self.isloadNum --;
                        $.hideLoading();//加载数据
                    });//把tpl中的方法注入到本对象中
                });
            }
        });
    },

    //初始页面完毕
    _initEnd: function(){
        var self = commonPage;
        if(self.isloadNum > 0){//判断是否加载完（主要是异步加载的时候）
            setTimeout(self._initEnd, 500);
            return;
        }
        //获取url中的hash值，进行左侧单独模拟点击
        var url = window.location.href;
        var hash = url.replace(self._urlRe, '$2');
        if($.inArray(hash, self._options.leftNavClassList) < 0){
            hash = 'index';
        }
        self.$leftObj.find(self._options.leftNavContainerSelector).find('.' + hash).trigger('click');

    },

    //内容遮罩内容填充并显示
    showContentAreaMark: function(html, callback){
        var self = this;
        self.$rightObj.find(self._options.rigthContentAreaMarkSelector).html(html).show();
        if(typeof callback === 'function'){
            callback();
        }
    },

    //内容遮罩内容清空并隐藏
    hideContentAreaMark: function(callback){
        var self = this;
        self.$rightObj.find(self._options.rigthContentAreaMarkSelector).html('').hide();
        if(typeof callback === 'function'){
            callback();
        }
    },

    //创建富文本编辑器
    createEditor: function(selector, options){
        var self = this;
        if(typeof selector !== 'string'){
            return;
        }
        var e = new self.E(selector);
        var _options = {
            uploadImgServer: self.wangEditorFileServer,
            withCredentials: true,
            onchange: function(html){
                $(selector + '-input').val(html);
            }
        };
        if(typeof options === 'object' && options !== null){
            Object.assign(_options, options);
        }
        for(var v in _options){
            e.customConfig[v] = _options[v];
        }
        e.create();
        self.E.fullscreen.init(selector);
        return e;
    },

    //创建文件下载器
    createFileUpload: function(options, callbackOptions){
        var self = this;
        $(options.dnd).uImgUpload({
            server: self.fileUploadServer,
            init: options.init
        }, callbackOptions);
    },

    //把碎片数据分隔
    splitFragment: function(name, delimiter, fullIndex, isInsertBefore){
        var self = this;
        fullIndex = typeof fullIndex !== 'string'?'请选择':fullIndex;
        isInsertBefore = typeof isInsertBefore === 'undefined'?true: !!isInsertBefore;
        delimiter = typeof delimiter === 'string'?delimiter: '|';
        var v = self.data.key_fragments[name];
        if(typeof v === 'object' && v !== null){
            vv = v.value_cn;
            if(typeof vv !== 'string'){
                vv = v.value_en;
            }
            if( typeof vv !== 'string'){
                if(Array.isArray(vv)){
                    vv = vv.join('|');
                }else{
                    return null;
                }
            }

            var res = vv.split(delimiter);
            var va = [];
            for(var i=0,item=null;i<res.length;i++){
                item = res[i];
                va.push({name: item, value: item});
            }
            if(va[0].name === ''){
                va[0].value = fullIndex;
            }else if(isInsertBefore){
                va.splice(0, 0, {name: '', value: fullIndex});
            }
            return va;
        }else{
            return null;
        }
    },

    //表单系列化为js对象
    serializeFormObject: function(selector) {
        var a, o, h, i, e;
        a = $(selector).serializeArray();
        o = {};
        h = o.hasOwnProperty;
        for (i = 0; i < a.length; i++) {
            e = a[i];
            if (!h.call(o, e.name)) {
                o[e.name] = e.value.replace(/(^\s*)|(\s*$)/g, "");
            }
        }
        return o;
    },
    
    //初始化
    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        self._initData();
        self._initEven();
        self._initEnd();
        return self;
    }
}