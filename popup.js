document.addEventListener("DOMContentLoaded", function () {
    var clicklistener = document.getElementById("btnStartWorker");
    // onClick's logic below:
    console.log("on event");
    clicklistener.addEventListener("click", function () {
        var port = chrome.runtime.connect({
            name: "Sample Communication",
        });
        // background 통신 On 메세지
        port.postMessage("On");
        alert("Start Worker");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var clicklistener = document.getElementById("btnStopWorker");
    // onClick's logic below:
    console.log("off event");
    clicklistener.addEventListener("click", function () {
        var port = chrome.runtime.connect({
            name: "Sample Communication",
        });
        // background 통신 Off 메세지
        port.postMessage("Off");
        alert("Stop Worker");
    });
});

document.addEventListener("DOMContentLoaded", function () {
    var clicklistener = document.getElementById("btnLinkToPage");
    // onClick's logic below:
    console.log("get user");
    clicklistener.addEventListener("click", function () {
        var port = chrome.runtime.connect({
            name: "Sample Communication",
        });
        // background 통신 Off 메세지
        port.postMessage("GetUser");
        port.onMessage.addListener(function (msg) {
            window.open("http://localhost:8080/log?page=0&name=" + msg);
        });
    });
});
