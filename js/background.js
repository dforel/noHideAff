 
// 是否拦截aff
var isInterceptAff;
var isNotifyAff;
var customRegFilterText;

var webRuleRegClass={
    map:{
        // "webUrl":["ruleList"],
    },
    array:[
    //     {
    //         id:1,
    //         url:"样例url",
	// 		reg:"样例reg",
	// 		isNotify:true,
	// 		isIntercept:true,
    //    }
    ],
    newId:1,// 当前最大id是多少，新建的时候使用
    index:"",
    text:"",
    count:0,

    getItemById:function (id) {
        for (let index = 0; index < this.array.length; index++) {
            var item = this.array[index];
            if(item.id == id){
                return item;
            }
        }
        return null;
    },
    addRule:function(url,reg,isNotify,isIntercept){
        if(url==''){
			alert("url不能空");
			return;
		}
		if(reg==''){
			alert("reg不能空");
			return;
        }
        
        this.array.push({
            id:this.newId,
			url:url,
			isNotify:isNotify,
			isIntercept:isIntercept,
            reg:reg
        })
        this.newId++; 
        this.storage();
	},
	modity:function (itemMod) {
        if(!itemMod){
            alert("获取要修改的对象失败。请重试");
            return;
        }
		this.array.forEach( (item, index, arr) => {
            if(item.id == itemMod.id){
                arr[index].reg=itemMod.reg;
                arr[index].url=itemMod.url;
                arr[index].isNotify=itemMod.isNotify;
                arr[index].isIntercept=itemMod.isIntercept;
            }
        }); 
        this.storage();
	},
    delRule:function(id){
        this.array.forEach( (item, index, arr) => {
            if(item.id == id){
                arr.splice(index, 1);
            }
        });
        // console.log(this.array);
        this.storage();
    },
    storage:function () { 
        this.text= JSON.stringify( this.array );
        chrome.storage.sync.set({webRuleRegStorage: this.text}, function() {
            console.log('保存webRuleRegClass成功！');
        });
    },
    jsonText:function (text) {
        this.text = text;
        this.array = JSON.parse(text);
        this.count=this.array.length;
        var least = this.array[this.count-1];
        this.newId = least.id+1;

        this.array.forEach(item => {
           var mapItem= {
                reg:item.reg,
                isIntercept:item.isIntercept,
                isNotify:item.isNotify
            };
            if(this.map.hasOwnProperty(item.url)){
                this.map[item.url].push(mapItem);
            }else{
                this.map[item.url]=[ mapItem ];
            }
        });
    } 
}




function sendMessageToContentScript(message, callback)
{
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs)
    {
        chrome.tabs.sendMessage(tabs[0].id, message, function(response)
        {
            if(callback) callback(response);
        });
    });
}

// 监听storge改变，实时获取设置
chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];  
		switch(key)
		{
			case "isInterceptAff":
				isInterceptAff = storageChange.newValue;
				break;
			case "isNotifyAff":
				isNotifyAff = storageChange.newValue;
				break;
			case "customRegFilterText":
				customRegFilterText = storageChange.newValue;
				break;
			case "webRuleRegStorage":
				webRuleRegStorage = storageChange.newValue;
				webRuleRegClass.jsonText(webRuleRegStorage);
				break;
			default:
				console.log('Storage key "%s" in namespace "%s" changed. ' +
						'Old value was "%s", new value is "%s".',
						key, namespace, storageChange.oldValue, storageChange.newValue);
		}
	}
}); 
 
chrome.storage.sync.get({webRuleRegStorage: ""}, function(items) {
    webRuleRegClass.jsonText(items.webRuleRegStorage);
});

chrome.storage.sync.get({isInterceptAff: true,isNotifyAff: true,customRegFilterText: null}, function(items) {  
	isInterceptAff = items.isInterceptAff;
	isNotifyAff = items.isNotifyAff;
	customRegFilterText= items.customRegFilterText;
});

var isBlockRequest=function (url) {
	urlObject = parseURL(url);
	
	var isIntercept=false;
	var isNotify=true;
	// -1是清空aff用的.
	if(urlObject.relative.indexOf("aff=-1")>-1){ 
		return {isNotify,isIntercept};
	}
	if(urlObject.relative.indexOf("aff=")>-1 || urlObject.relative.indexOf("cpskey=")>-1 || urlObject.relative.indexOf("ursecode=")>-1){
		isIntercept = true;
		return {isNotify,isIntercept};
	}

	// 全局拦截
	if(customRegFilterText && customRegFilterText!="" ){
		var re = new RegExp(customRegFilterText,"gim"); 
		isIntercept = re.test(urlObject.relative); 
		if(isIntercept){
			return {isNotify,isIntercept};
		}
	} 

	// console.log(webRuleRegClass.map,url)
	// 自定义网站拦截
	for(let key  in webRuleRegClass.map){
		var urlFilterArr = webRuleRegClass.map[key];
		if(urlObject.host.indexOf(key)>-1 ){
			for (const urlFileter of urlFilterArr) {
				var re = new RegExp(urlFileter.reg,"gim"); 
				isIntercept = re.test(urlObject.relative); 
				// console.log(re,urlObject.relative,isIntercept)
				if(isIntercept && urlFileter.isIntercept){
					isNotify = urlFileter.isNotify;
					return {isNotify,isIntercept};
				}
			} 
		}
	}
	
	return {isNotify,isIntercept};
}

// web请求监听，最后一个参数表示阻塞式，需单独声明权限：webRequestBlocking
chrome.webRequest.onBeforeRequest.addListener(details => {
	// console.log(details); 
	
	
	var blockResult = isBlockRequest(details.url); 
	
	if(isNotifyAff && blockResult.isIntercept && blockResult.isNotify ){ 
		chrome.notifications.create(null, {
			type: 'basic', 
            iconUrl: 'img/icon.jpg',
			title: '发现一个aff请求，已经帮你拦截',
			message: '来源：' + details.initiator + '\n请求地址：' + details.url //+"\n 打开F12可以再console框中手动复制链接！"
		});
		
		sendMessageToContentScript({cmd:'msg', value:'发现一个aff请求，已经帮你拦截,来源：'+details.initiator+'\n请求地址：'+details.url}, function(response)
		{
			// console.log('来自content的回复：'+response);
		}); 
	}
	
	if(isInterceptAff && blockResult.isIntercept ){ 
		// cancel 表示取消本次请求
		
		// 保存数据
		chrome.storage.sync.set({lastInterceptAffURL: details.url}, function() {
			// console.log('保存lastInterceptAffURL成功！');
		});
		return {cancel: true}
	}
	
	 
}, {urls: ["<all_urls>"]}, ["blocking"]);


function parseURL(url) { 
    var a = document.createElement('a'); 
    a.href = url; 
    return { 
        source: url, 
        protocol: a.protocol.replace(':',''), 
        host: a.hostname, 
        port: a.port, 
        query: a.search, 
        params: (function(){ 
            var ret = {}, 
            seg = a.search.replace(/^\?/,'').split('&'), 
            len = seg.length, i = 0, s; 
            for (;i<len;i++) { 
                if (!seg[i]) { continue; } 
                s = seg[i].split('='); 
                ret[s[0]] = s[1]; 
            } 
            return ret; 
        })(), 
        file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1], 
        hash: a.hash.replace('#',''), 
        path: a.pathname.replace(/^([^\/])/,'/$1'), 
        relative: (a.href.match(/tps?:\/\/[^\/]+(.+)/) || [,''])[1], 
        segments: a.pathname.replace(/^\//,'').split('/') 
    }; 
}