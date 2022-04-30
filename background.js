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
        const tabId = tab[0].id;
        chrome.storage.local.get([`${tab[0].id}`], function (result) {
            console.log("탭 전환 후 캐시 없음");
            if (isEmpty(result[tabId])) {
                return;
            } else {
                console.log("탭 전환 후 캐시 있음");
                const globalKeyword = { global: result[tabId] };
                chrome.storage.local.set(globalKeyword, function () {
                    console.log("글로벌 캐시에 현재 탭의 키워드 저장", globalKeyword);
                });
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

    function keywordSearchAction() {
        console.log("업데이트 - 검색 시나리오", tabId);
        const tabKeyword = {};
        tabKeyword[tabId] = getKeyword(tab.title);
        updateAndSendEvent(tabKeyword);
    }

    function pageUpdateAction() {
        console.log("업데이트 - 검색X 시나리오", tabId);
        chrome.storage.local.get([`${tabId}`], function (result) {
            if (isEmpty(result[tabId])) {
                console.log("탭 캐시가 없음", result[tabId]);
                chrome.storage.local.get([`global`], function (result) {
                    console.log("글로벌 캐시 조회", result);
                    if (isEmpty(result.global)) {
                        console.log("글로벌 캐시가 없는 경우 아무 동작 못함");
                    } else {
                        console.log("글로벌 캐시가 있는 경우 ", result.global);
                        const tabKeyword = {};
                        tabKeyword[tabId] = result.global;
                        updateAndSendEvent(tabKeyword);
                    }
                });
            } else {
                console.log("탭 캐시가 있음. 이벤트 전송", result[tabId]);
                sendEvent(result[tabId]);
            }
        });
    }

    function updateAndSendEvent(tabKeyword) {
        chrome.storage.local.set(tabKeyword, function () {
            console.log("캐시 업데이트", tabKeyword);
            sendEvent(Object.values(tabKeyword)[0]);
        });
    }

    function sendEvent(keyword) {
        fetchData({
            user: user,
            keyword: keyword,
            url: tab.url,
            visitedTime: new Date(),
        });
    }

    function verifyLoadingStatus() {
        return changeInfo.status == "complete" && tab.url != undefined;
    }

    function verifySearchStatus(title) {
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

function fetchData(data) {
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
