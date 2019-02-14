//轮询 等待页面加载完成
let timer = setInterval(polling, 200);
const options = {
    interfaces: []
};
const BTNS = [];
let TAB_ID = "";
/**
 * 初始化
 */
function init() {
    //console.log("init");
    //监听POPUP 的信息
    chrome.runtime.onMessage.addListener(function(
        request,
        sender,
        sendResponse
    ) {
        let rtn;
        if (request.cmd == "search") {
            rtn = findInterface(request.value);
            sendResponse({
                msg: "检索成功",
                data: rtn
            });
            return;
        }
        if (request.cmd == "go") {
            let key = request.value;
            //点击tab页 达到不刷新页面模拟跳转
            // resouce active
            //endpoint
            let endpoint = options.interfaces[key].el;
            let toggleEndpointList = endpoint.parentNode.parentNode;
            if (checkEndpointListOpened(toggleEndpointList)) {
                toggleEndpointList.querySelector(".toggleEndpointList").click();
                toggleEndpointList.querySelector(".toggleEndpointList").scrollIntoView();
            }
            // path active
            let toggleOperation = endpoint.querySelector(".toggleOperation");
            //是否需要隐藏其他所有的 tab ?
            //需要判断当前是否是打开状态
            if (checkEndpointOpened(endpoint)) {
                toggleOperation.click();
               
            }
            toggleOperation.scrollIntoView();
            sendResponse("go successfully");
        }
    });
}
function checkEndpointOpened(endpoint) {
    let is = false;
    let content = endpoint.querySelector(".content");
    is = content.style.display == "none";
    //console.log('checkEndpointOpened',is);
    return is;
}
function checkEndpointListOpened(EndpointList) {
    let is = false;
    let content = EndpointList.querySelector(".endpoints");
    is = content.style.display == "none";
    //console.log('checkEndpointListOpened',is);

    return is;
}
/**
 * 轮询
 */
function polling() {
    let wraps = document.querySelectorAll(".resource .endpoint");
    if (wraps.length) {
        clearInterval(timer);
        addBtns(wraps);
        init();
    }
    //console.log("polling!");
}
polling();
//add btns
function addBtns(doms) {
    doms.forEach((element, key) => {
        let pathEl = element.querySelector(".path");
        let btn = document.createElement("a");
        btn.setAttribute("class", "swage_copy");
        btn.innerText = "【复制】";
        pathEl.appendChild(btn);
        let url = element.querySelector(".path a").innerText;
        btn.addEventListener("click", function() {
            Copy(url);
            //console.error(`复制成功！：${url}`);
        });
        //describe
        let des = element.querySelector(".options .markdown").innerText;
        //增加到options
        let rtn = {
            el: element,
            val: url,
            des,
            key,
            href: element.querySelector("a").href
        };
        options.interfaces.push(rtn);
    });
}

//复制
function Copy(str) {
    var save = function(e) {
        e.clipboardData.setData("text/plain", str);
        e.preventDefault();
    };
    document.addEventListener("copy", save);
    document.execCommand("copy");
    document.removeEventListener("copy", save);
}

//OOP
function btn(opt) {
    this.name = "default";
    this.el = null;
    this.init = function() {
        for (let i in opt) {
            this[i] = opt[i];
        }
        !this.el && this.createSelf();
        BTNS.push(this);
    };
    this.createSelf = function() {
        this.el = document.createElement("div");
        let el = this.el;
        el.setAttribute("class", "swage_btn");
        el.innerText = "【" + this.name + "】";
        //bind event
        el.addEventListener("click", this.onClick);
        return el;
    };
    this.onClick = null;
    this.init();
}

//panel achitect
function panel(opt) {
    this.el; // self el
    this.slide; //el
    this.state = 0;

    this.init(opt);
}
panel.prototype = {
    init: function(opt) {
        let self = this;
        for (let i in opt) {
            this[i] = opt[i];
        }
        var panel = document.createElement("div");
        panel.setAttribute("class", "swage_panel");
        var slide = document.createElement("div");
        slide.setAttribute("class", "swage_panel_slide");
        slide.style.display = "flex";
        //append btns
        document.querySelector("body").appendChild(panel);
        document.querySelector("body").appendChild(slide);
        // panel.appendChild(slide);
        this.el = panel;
        this.slide = slide;
        //console.log(this.el, this.slide);
        //bind event
        this.el.addEventListener("click", this.toggle.bind(this));
        return panel;
    },
    show: function() {
        this.state = 1;
        this.slide.style.display = "flex";
    },
    hide: function() {
        this.state = 0;
        this.slide.style.display = "none";
    },
    onClick: function() {},
    toggle: function() {
        let self = this;
        if (self.state) {
            self.hide();
        } else {
            self.show();
        }
        self.onClick();
    },
    addBtn: function(obj) {
        this.slide.appendChild(obj.el);
    }
};

//查找
let btn_search = new btn({
    name: "search",
    onClick: function(ev) {
        let kw = prompt("关键词/接口名");
        findInterface(kw);
        //content 需要唤醒popup
        //TODO
    }
});

function findInterface(kw) {
    let rtn = {
        key: kw,
        list: []
    };
    options.interfaces.forEach(it => {
        let text = it.val;
        let des = it.des;
        //关键词不区分大小写
        let reg = new RegExp(kw, "ig");
        if (text.match(reg) || des.match(reg)) {
            rtn.list.push(it);
        }
    });
    //console.log(rtn);
    return rtn;
}
//返回顶部
let btn_back2Top = new btn({
    name: "back2Top",
    onClick: function() {
        document.querySelector("#header").scrollIntoView();
    }
});

//关闭所有标签
let btn_closeAll = new btn({
    name: "closeAll",
    onClick: function() {
        closeAllTag();
    }
});

function closeAllTag() {
    let home = window.location.href.split("#")[0];
    // window.location.href = home;
    let actives = document.querySelectorAll(".active .heading h2 a");
    //console.log(actives);
    actives.forEach(el => el.click());
    // window.history.replaceState('','original',home + '#/');
}
let panel_ins = new panel();
BTNS.forEach(b => panel_ins.addBtn(b));

// The ID of the extension we want to talk to.
var editorExtensionId = "gekcmaloaapfhlmgbgblblnbdjjoladf";

