(function () {
    //constant
    const ACTION = {
        SEARCH: "search",
        openNewTab: openNewTab
    };
    //search
    let ctx = document.querySelector("#content");
    ctx.addEventListener("click", function (ev) {
        let target = event.target;
        console.log(target.tagName);
        if (target.tagName != "BUTTON") return;
        else {
            let href = target.getAttribute("data-href");
            let idx = target.getAttribute("data-idx");
            let fn = target.getAttribute('data-fn');
            if (fn) {
                ACTION[fn](ev);
            }
            console.log("gohref", href, idx);
            sendMessageToContentScript({
                    cmd: "go",
                    value: idx
                },
                function (res) {
                    console.log(res);
                }
            );
        }
    });
    //oop
    let input = document.querySelector("input");
    let btn = document.querySelector(".search-wrap .btn");
    input.onkeydown = function (ev) {
        console.log(ev.keyCode);
        //TODO 增加搜索的UI反馈
        if (ev.keyCode == 13) {
            btn.click();
        }
    };
    btn.onclick = function (ev) {
        console.log("hi hi hi");
        sendMessageToContentScript({
                cmd: "search",
                value: input.value
            },
            function (response) {
                console.warn("收到!", response);
                let apis = response.data.list || [];
                render(apis, response.data.key);
                storeKeyword(response.data.key);
            }
        );
    };
    // 多个tab页面需要通信，具体的sort是由页面当中的函数解决的
    function sendMessageToContentScript(message, callback) {
        chrome.tabs.query({
                active: true,
                currentWindow: true
            },
            function (tabs) {
                chrome.tabs.sendMessage(tabs[0].id, message, function (
                    response
                ) {
                    if (callback) callback(response);
                });
            }
        );
    }

    function render(arr, kw) {
        //无法正确引用模板引擎 故手写渲染引擎
        let html = `<h2>搜索结果${arr.length}个</h2>`;
        let reg = new RegExp(kw, 'ig');
        arr.forEach((api, i) => {
            let rApi = api.val.replace(reg, m => `<span class='keyword'>${m}</span>`);
            let rDes = api.des.replace(reg, m => `<span class='keyword'>${m}</span>`);
            let template = `  
            <li>
                <p class='api-val'>${rApi}</p>
                <p class='api-des'>${rDes}</p>
                <button  data-idx="${api.key}" data-href="${api.href}">GO</button>
                <button data-fn="openNewTab" data-idx="${api.key}" data-href="${api.href}">NEW TAB</button>
            </li>
            `;
            html += template;
        });
        document.querySelector("#content ul").innerHTML = html;
    }

    function storeKeyword(kw) {
        window.localStorage.setItem('searchKey', kw);
    }

    function readStoreKeyword() {
        let key = window.localStorage.getItem('searchKey');
        if (key) {
            input.value = key;
            btn.click();
        }
    }
    readStoreKeyword();

    function openNewTab(ev) {
        window.open(ev.target.getAttribute('data-href'));
    }
})();