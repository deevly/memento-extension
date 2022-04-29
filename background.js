var turnoff = true;
var user = "";

chrome.windows.onRemoved.addListener(function () {
    chrome.storage.local.clear(function () {
        console.log("크롬 종료 및 캐시 정리");
    });
});

chrome.tabs.onActivated.addListener(function () {
    if (turnoff) {
        return;
    }

    chrome.tabs.query({ active: true }, function (tab) {
        const tabId = `${tab[0].id}`;
        var globalKeyword;
        chrome.storage.local.get([tabId], function (result) {
            if (isEmpty(result[tab[0].id])) {
                return;
            } else {
                console.log("탭 전환 후 캐시 있음");
                globalKeyword = result[tab[0].id];
                chrome.storage.local.set(
                    { global: globalKeyword },
                    function () {
                        console.log(
                            "탭 전환 후 캐시 있으니까 저장",
                            globalKeyword
                        );
                    }
                );
            }
        });
    });
});

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (turnoff) {
        return;
    }

    if (verifyLoadingStatus()) {
        if (verifySearchStatus(tab.title)) {
            keywordSearchAction();
        } else {
            pageUpdateAction();
        }
    }

    function pageUpdateAction() {
        console.log(tabId);
        chrome.storage.local.get([`${tabId}`], function (result) {
            if (isEmpty(result[tabId])) {
                console.log(
                    "캐시 없음 시퀸스 ",
                    globalKeyword,
                    "???",
                    result[tabId]
                );
                chrome.storage.local.get([global], function (result) {
                    chrome.storage.local.set(tabKeyword, function () {});
                });
            } else {
                console.log(
                    "캐시 있음 시퀸스 ",
                    globalKeyword,
                    "???",
                    result[tabId]
                );
            }
        });
    }

    function keywordSearchAction() {
        const tabKeyword = {};
        tabKeyword[tabId] = getKeyword(tab.title);
        console.log(tabKeyword);
        chrome.storage.local.set(tabKeyword, function () {
            globalKeyword = getKeyword(tab.title);
            console.log("검색어 시퀸스 ", globalKeyword);
            sendPost({
                user: user,
                keyword: globalKeyword,
                url: tab.url,
                visitedTime: new Date(),
            });
        });
    }

    function verifyLoadingStatus() {
        return changeInfo.status == "complete" && tab.url != undefined;
    }

    function verifySearchStatus(title) {
        console.log("구글 검색 시나리요 ", title);
        const googlePostFix = " - Google 검색";
        return title.indexOf(googlePostFix) > -1;
    }

    function getKeyword(title) {
        return title.slice(0, -12);
    }
});

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((msg, port) => {
        if (msg == "On") {
            turnOn();
        } else if (msg == "Off") {
            turnOff();
        } else if (msg == "GetUser") {
            passUserInfo();
        }

        function turnOn() {
            console.log("이벤트 감지 시작");
            chrome.identity.getProfileUserInfo(function (userInfo) {
                user = userInfo.email;
            });
            turnoff = false;
            globalKeyword = "";
        }

        function turnOff() {
            console.log("이벤트 감지 종료");
            turnoff = true;
            chrome.storage.local.clear(function () {
                console.log("크롬 종료 및 캐시 정리");
            });
        }

        function passUserInfo() {
            console.log("유저 정보 전달");
            chrome.identity.getProfileUserInfo(function (userInfo) {
                port.postMessage(userInfo.email);
            });
        }
    });
});

function sendPost(data) {
    chrome.identity.getProfileUserInfo(function () {
        console.log(JSON.stringify(data));
        fetch("http://localhost:9180/event", {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        }).catch((error) => console.log("error:", error));
    });
}

function isEmpty(str) {
    if (typeof str == "undefined" || str == null || str == "") return true;
    else return false;
}
