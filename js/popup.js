// 读取数据，第一个参数是指定要读取的key以及设置默认值
var isInterceptAff; 
var isNotifyAff;
var customRegFilterText;
var lastInterceptAffURL;

$(function(){
	// 初始化时候设置是否拒绝aff，是否提醒
	chrome.storage.sync.get({isInterceptAff: true,isNotifyAff: true,lastInterceptAffURL:"" , customRegFilterText: ""}, function(items) {  
		console.log(items); 
		lastInterceptAffURL =  items.lastInterceptAffURL; 
		// $("#customRegFilter").val(items.customRegFilterText); 

		initSwitch('#isNotifyAff',items.isNotifyAff,function(event,state){
            chrome.storage.sync.set({isNotifyAff: state}, function() {
                console.log('保存isInterceptAff成功！');
            });
          });
        initSwitch('#isInterceptAff',items.isInterceptAff,function(event,state){ 
            // 保存数据
            chrome.storage.sync.set({isInterceptAff: state}, function() {
                console.log('保存isInterceptAff成功！');
            }); 
		}); 
		

	});
	
	
	// 监听配置项
	$("#isInterceptAff").change(function(e){ 
		isInterceptAff = $(this).is(':checked');
		
		// 保存数据
		chrome.storage.sync.set({isInterceptAff: isInterceptAff}, function() {
			console.log('保存isInterceptAff成功！');
		});
	});
	
	$("#isNotifyAff").change(function(e){ 
		isNotifyAff = $(this).is(':checked');
		
		// 保存数据
		chrome.storage.sync.set({isNotifyAff: isNotifyAff}, function() {
			console.log('保存isNotifyAff成功！');
		});
	}); 

	$("#customRegFilter").change(function(e){
		console.log($(this).val());
		customRegFilterText = $(this).val();
		
		// 保存数据
		chrome.storage.sync.set({customRegFilterText: customRegFilterText}, function() {
			console.log('保存customRegFilterText成功！');
		});
	}); 

	$("#clearAffCookiess").click(function(e){ 
		 clear();
	}); 

	$('#goLinkConfig').click(function (e) {
		
		goLinkConfig();
	})

	$('#fastCopy').click(function (e) { 
		write_Clipper(lastInterceptAffURL); 	
	})
 
});


function goLinkConfig(){
	var url = chrome.extension.getURL('html/config.html');
	chrome.tabs.create({url});
}
 

function clear(){
	(function(){
		if(document.cookie.indexOf('WHMCSAffiliateID')==-1 && document.cookie.indexOf('HBAffiliate')==-1){
			alert('未能读取AFF信息，\r\n请按F12手动删除：\r\nStorage - Cookies - WHMCSAffiliateID | HBAffiliate');
		}
		var path=window.location.href.substring(0,window.location.href.lastIndexOf('/'))+'/';
		var w=new XMLHttpRequest();
		w.open('GET',path+'aff.php?aff=-1',true);
		w.onreadystatechange=function(e){
			document.cookie='WHMCSAffiliateID=;path=/;domain='+document.domain;
			document.cookie='WHMCSAffiliateID=;path=/;domain=.'+document.domain;
		};
		w.send();
		document.cookie='HBAffiliate=;path=/;domain='+document.domain;
		document.cookie='HBAffiliate=;path=/;domain=.'+document.domain;
		alert("已经设置aff为-1");
	})()
}