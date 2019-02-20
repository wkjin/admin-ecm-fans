(function($){
    $.p
    //jquery工具
    var _jqueryTools = {
        //把style添加到头部
        addStyleToHead: function(id, styleStr, isFocus){
            if($(id).length > 0){
                if(isFocus === true){
                    $(id).html(styleStr);
                    return true;
                }else{
                    return false;
                }
            }else{
                $('head').append($('<style id="' + id + '">' + styleStr + '</style>'));
            }
        }
    };

    //图片上传控件
    var _uImgUpload = {
        uImgUpload: function(options, callbackOptions){
            var self = this, $this = this;
            var uImgUploadClass = 'u-img-upload-container';
            var hasImgClass = 'u-img-upload-has-img';//有图片时候容器class
            var imgSelector = '.u-img-upload-file';//图片选者器的选者请
            var textHtmlSelector = '.u-img-html';//文字html的选者请
            var styleStr = '';
            $this.addStyleToHead('uImgUpload', styleStr);
            $this.each(function(index, dom){
                var $dom = $(dom);
                if($dom.hasClass(uImgUploadClass)){
                    console.log('已经加载过，无须重新加载');
                    return self;
                }
                var mathRand = parseInt(Math.random()* 100000000000);
                var fileInputId = 'u-img-input-' + mathRand;
                var containerId = 'u-img-upload-container' + mathRand;
                $dom.addClass(uImgUploadClass).prop('id', containerId).html('<span class="u-img-html">+</span><img class="u-img-upload-file" src=""/>').show().parent().append('<span id="' + fileInputId + '" style="display:none!important;"></span>');
                self.uWebUploader(Object.assign({
                    pick: '#' + fileInputId,
                    dnd: '#' + containerId,
                    accept: {
                        title: 'Images',
                        extensions: 'gif,jpg,jpeg,bmp,png',
                        mimeTypes: 'image/*'
                    },
                    crop: false,//不允许截取
                    withCredentials: true,//携带cookie
                    auto: true,//自动上传
                }, options), Object.assign({
                    _ready: function(){
                        if(typeof options === 'object' && typeof options.init ==='object'){
                            var init = options.init;
                            //如果有图片
                            if(typeof init.imgUrl === 'string' && init.imgUrl.replace(/\s*/, '') !== ''){
                                $dom.addClass(hasImgClass).find(imgSelector).attr('src', init.imgUrl);
                            }
                            //文字替代
                            if(typeof init.textHtml){
                                $dom.find(textHtmlSelector).html(init.textHtml);
                            }
                        }
                    },
                    _uploadSuccess: function(file, uploadRes){
                        if(uploadRes.errno === 0){
                            var fileNameArr = uploadRes.data;
                            if(typeof fileNameArr !== 'object'){
                                console.error('上传接口出错', uploadRes);
                            }else{
                                var fileName = fileNameArr[0];
                                if(typeof fileName === 'string'){
                                    $dom.addClass(hasImgClass).find(imgSelector).attr('src', fileName);
                                }else{
                                    console.error('上传接口出错', uploadRes);
                                }
                            }
                        }else{
                            console.error('上传失败', uploadRes);
                        }
                    }
                }, callbackOptions));
            });
            return self;
        }
        
    };

    $.webUploaderLoadingNum = 0;//webUploader正在加载的数量
    $.uFileUploadServerUrl = '';//文件上传的地址

    //文件上传
    var _uWebUploader = {
        
        //设置UFile上传的地址
        setUFileUploaderServer: function(url){
            var self = this;
            $.uFileUploadServerUrl = url;   
            return self; 
        },
        
        //加载事件
        uWebUploader: function(options, callbackOptions){
            var self = this;
            if($.webUploaderLoadingNum > 0){//检测是否可以加载webUploader
                setTimeout(function(){
                    self.uWebUploader(options, callbackOptions);
                }, 500);
                return;
            }else{
                $.webUploaderLoadingNum ++;
            }
            var _options = {
                swf: './assets/webuploader/Uploader.swf',
                server: $.uFileUploadServerUrl,// 文件接收服务端。
                pick: '#picker',
                dnd: '#dndArea',
                disableGlobalDnd: false,
                formData: {},
                duplicate: true,//允许多次上传
                resize: true,
                auto: true,//自动上传
            }
            Object.assign(_options, options);
            if(_options.server === ''){
                console.log('上传的地址没有设定，可能导致出错');
            }
            //检测WebUploader是否可以存在
            if(typeof WebUploader === 'undefined'){
                console.error('依赖的WebUploader不存在');
                return null;
            }

            //创建文件上传控件并返回
            return new WebUploader.Uploader(_options)
            .on('ready', function(){//设置拖拽框与上传按钮融合
                if($(_options.pick).find('input[type=file]').length > 0){//这里无法统一（还不知道理由），统一的话会出项文件无法多次选择
                    $(_options.dnd).off('click').on('click', function(){
                        $(_options.pick).find('input[type=file]').trigger('click');
                    });
                }else{//绑定上传失败
                    console.error(_options.dnd + '绑定上传失败');
                }
                $.webUploaderLoadingNum --;
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._ready === 'function' ){
                    callbackOptions._ready();
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.ready === 'function' ){
                    callbackOptions.ready();
                }
            }).on( 'uploadProgress', function( file, percentage ) {// 文件上传过程中创建进度条实时显示。
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._uploadProgress === 'function' ){
                    callbackOptions._uploadProgress(file, percentage);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.uploadProgress === 'function' ){
                    callbackOptions.uploadProgress(file, percentage);
                }
            }).on('fileQueued', function(file){
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._fileQueued === 'function' ){
                    callbackOptions._fileQueued(file);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.fileQueued === 'function' ){
                    callbackOptions.fileQueued(file);
                }
            }).on('filesQueued', function(files){
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._filesQueued === 'function' ){
                    callbackOptions._filesQueued(files);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.filesQueued === 'function' ){
                    callbackOptions.filesQueued(files);
                }
            }).on( 'uploadSuccess', function( file,  uploadRes ) {// 文件上传成功，给item添加成功class, 用样式标记上传成功。
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._uploadSuccess === 'function' ){
                    callbackOptions._uploadSuccess(file, uploadRes);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.uploadSuccess === 'function' ){
                    callbackOptions.uploadSuccess(file, uploadRes);
                }
            }).on( 'uploadError', function( file , uploadRes) {// 文件上传失败，显示上传出错。
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._uploadError === 'function' ){
                    callbackOptions._uploadError(file, uploadRes);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.uploadError === 'function' ){
                    callbackOptions.uploadError(file, uploadRes);
                }
            }).on( 'uploadComplete', function( file ) {// 完成上传完了，成功或者失败，先删除进度条。
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions._uploadComplete === 'function' ){
                    callbackOptions._uploadComplete(file);
                }
                if(typeof callbackOptions === 'object' && callbackOptions !== null && typeof callbackOptions.uploadComplete === 'function' ){
                    callbackOptions.uploadComplete(file);
                }
            }); 
        }
    };
    
    $.fn.extend(Object.assign({},
        _jqueryTools,//jquery工具集合
        _uWebUploader,//文件上传工具（包括拖拽）
        _uImgUpload,//图片上传控件
    ));
})(jQuery);