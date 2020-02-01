// import {webRuleRegClass} from 'WebRuleRegClass';
// document.write("<script language='javascript' src='./WebRuleRegClass.js'></script>");
var newIsNotify  =  true;
var newIsIntercept= true;

function addTrToTable(item) {
    //动态添加行 
    var trHTML = '<tr id="line_'+item.id+'"><td>'+item.id+'</td><td>'+item.url+'</td><td>'+item.reg+'</td>'+
                '<td>  <input style="margin-right: 5px;margin-top: 5px" target-id="'+item.id+'" id="isNotify'+item.id+'" type="checkbox"  checked> </td>'+
                '<td>  <input style="margin-right: 5px;margin-top: 5px" target-id="'+item.id+'" id="isIntercept'+item.id+'" type="checkbox"  checked> </td>'+
                '<td><button type="button" target-id="'+item.id+'" class="removeWebRule btn btn-danger">删除</button>  </td></tr>';
    $('#ruleTable').append(trHTML);   

    initSwitch('#isNotify'+item.id,item.isNotify,function (event,state) {
        var modifyId = $(this).attr("target-id");
        var item = webRuleRegClass.getItemById(modifyId);
        if(item!=null){
            item.isNotify = state; 
            webRuleRegClass.modity(item);
        }else{
            alert("发生异常");
        }
    });
    initSwitch('#isIntercept'+item.id,item.isIntercept,function (event,state) {
        var modifyId = $(this).attr("target-id");
        var item = webRuleRegClass.getItemById(modifyId);
        if(item!=null){
            item.isIntercept = state;
            webRuleRegClass.modity(item);
        }else{
            alert("发生异常");
        }
    });
}

function webRuleRegToTable(){
    $('#ruleTable').html("");
    webRuleRegClass.array.forEach(item => {
        addTrToTable(item);
    }); 

    $(".removeWebRule").on('click', function() {
        var delId = $(this).attr("target-id");
        webRuleRegClass.delRule( delId );
        webRuleRegToTable();
    }); 
}


$(function(){ 
    $("#addRule").click(function (e) { 
        if( $(this).text() == '增加规则'){ 
            $("#addRuleDiv").show(); 
            $(this).text("取消");
            $(this).removeClass("btn-primary");
            $(this).addClass("btn-Default");
        }else{  
            $("#addRuleDiv").hide();
            $(this).text("增加规则")
            $(this).removeClass("btn-Default");
            $(this).addClass("btn-primary");
        }

        $(this).attr("disabled", true); 

        setTimeout(function (e) {
            $("#addRule").attr("disabled", false); 
        },200)
    });

    $("#saveRule").click(function (e) {
        webRuleRegClass.addRule( $("#newUrl").val() , $("#newReg").val() , newIsNotify  , newIsIntercept ); 
        $("#newUrl").val("");
        $("#newReg").val("");
        
        $('#newIsNotify').bootstrapSwitch('state', true);
        $('#newIsIntercept').bootstrapSwitch('state', true);
 
        webRuleRegToTable();

    });

    $("#requestRule").click(function (e) {
        $.ajax({
            method: 'get',
            url: "https://xhvps.info/tool/ruleList.json",
            success: (res) => {
                //  console.log(res);
                webRuleRegClass.combine(res); 
                webRuleRegToTable();  
            },
            error: (e) => {
                alert("拉取规则失败");
                console.error('Failed to request rule list', e);
            },
        });
 
    });
 
    initSwitch('#newIsNotify',true,function (event,state) {
        newIsNotify = state; 
    });

    initSwitch('#newIsIntercept',true,function (event,state) {
        newIsIntercept = state;
    });

	// 初始化时候设置是否拒绝aff 
	chrome.storage.sync.get({isInterceptAff: true,isNotifyAff: true,lastInterceptAffURL:"" , customRegFilterText: "",webRuleRegStorage:""}, function(items) {  
		 
        if(items.webRuleRegStorage!=""){
            webRuleRegClass.jsonText(items.webRuleRegStorage);
            console.log(items.webRuleRegStorage)
            $('#ruleTable').html(""); 
            webRuleRegToTable();
        }
        
        $("#customRegFilter").val(items.customRegFilterText); 
        
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
	
	$("#customRegFilter").change(function(e){
		console.log($(this).val());
		customRegFilterText = $(this).val();
		
		// 保存数据
		chrome.storage.sync.set({customRegFilterText: customRegFilterText}, function() {
			console.log('保存customRegFilterText成功！');
		});
	}); 
    
}); 