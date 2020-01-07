chrome.runtime.onMessage.addListener(function(request, sender, sendResponse)
{  
    // console.log(sender.tab ?"from a content script:" + sender.tab.url :"from the extension");
	console.log('v');
    if(request.cmd == 'msg') 
	{ 
		console.log('%c '+request.value,'color:#bada55;font-size: 25px;');
	}
    // sendResponse('我收到了你的消息！');
});