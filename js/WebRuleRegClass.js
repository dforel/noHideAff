var webRuleRegClass={
    map:{
        // "webUrl":[{"reg":"","isNotify":true,"isIntercept":true}],
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
    combine:function(newRuleList){
        for( var rule of newRuleList)
        { 
            if( this.haveRule(rule.url,rule.reg) ){
                continue;
            }
            this.addRule(rule.url,rule.reg,rule.isNotify,rule.isIntercept) 
        }
    },
    haveRule:function(compareUrl,compareReg){
        if(this.map.hasOwnProperty(compareUrl)){
            regList = this.map[compareUrl];
            for (let index = 0; index < regList.length; index++) {
                const regItem = regList[index];
                if(regItem.reg == compareReg){
                    return true;
                } 
            }
        }
        return false;
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
