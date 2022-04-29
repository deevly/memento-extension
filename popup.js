document.addEventListener("DOMContentLoaded", function () {
    var clicklistener = document.getElementById("btnStartWorker");

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

// document.addEventListener("DOMContentLoaded", function () {
//     var clicklistener = document.getElementById("btnLinkToPage");

//     console.log("get user");
//     clicklistener.addEventListener("click", function () {
//         var port = chrome.runtime.connect({
//             name: "Sample Communication",
//         });

//         port.postMessage("GetUser");
//         port.onMessage.addListener(function (msg) {
//             window.open("http://localhost:8080/log?page=0&name=" + msg);
//         });
//     });
// });
