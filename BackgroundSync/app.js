// Copyright 2019 Bhautik
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*
 ******************************
  VARIABLE DECLARATIONS
 ******************************
*/
const pageLoading = document.querySelector("#loading");
const formPage = document.querySelector("#feedback-form");
const statusPage = document.querySelector("#feedback-status");
const sentSentence = document.querySelector("#waitingForSend");
const waitingSentense = document.querySelector("#sent");
const sendFeedbackButton = document.querySelector("#sentFeedback");
const emailInput = document.querySelector("#email");
const feedbackInput = document.querySelector("#feedback");

/*
 ******************************
  FUNCTIONS DECLARATIONS
 ******************************
*/


const init = () => {
    // check the status of feedback by using local storage
    var storage = localStorage;
    if(storage.getItem("feedback") == undefined) {
        storage.setItem("feedback", false);
        formPage.style.display = "block";
        formPage.setAttribute("data-hidden", "false");
    }
    else {
        if(storage.getItem("feedback") == "true") {
            // already feedback given
            formPage.style.display = "none";
            formPage.setAttribute("data-hidden", "true");
            statusPage.style.display = "block";
            statusPage.setAttribute("data-hidden", "false");
        }
        else if(storage.getItem("feedback") == "false"){
            // feedback is not given
            statusPage.style.display = "none";
            statusPage.setAttribute("data-hidden", "true");
            formPage.style.display = "block";
            formPage.setAttribute("data-hidden", "false");
        }
        else {
            // invalid state
            statusPage.style.display = "none";
            statusPage.setAttribute("data-hidden", "true");
            formPage.style.display = "block";
            formPage.setAttribute("data-hidden", "false");
        }
    }
}

/*
******************************
 EVENT DECLARATIONS
******************************
*/
window.addEventListener("load", (event) => {
    pageLoading.style.display = "none";
    pageLoading.setAttribute("data-hidden", true);
    formPage.style.display = "none";
    statusPage.style.display = "none";
    new Promise(function (resolve, reject) {
        Notification.requestPermission(function (result) {
            if (result !== 'granted') return reject(Error("Denied notification permission"));
            resolve();
        })
    })
    .then()
    .catch(() => alert("Allow notification from settings!, so we will send the your feedback status!"));
    init();
});

sendFeedbackButton.addEventListener("click", (event) => {
    event.preventDefault();

    sendFeedbackButton.disabled = true;
    const email = emailInput.value.toString().trim();
    const feedback = feedbackInput.value.toString().trim();
    if(email == "" || feedback == "") {
        alert("Invalid value in email or feedback");
        sendFeedbackButton.disabled = false;
        
    }
    else {
        localStorage.setItem("feedback", true);
        init();
        var request = window.indexedDB.open("feedback-sync", 1);
        var data = {
            email: null,
            feedback: null,
            timestamp: null
        };
        request.onsuccess = (event) => {
            var db = event.target.result;
            data.timestamp = new Date().getTime();
            data.email = email;
            data.feedback = feedback;
            var feedbackTrx = db.transaction("feedbacks", "readwrite");
            var feedbackStore = feedbackTrx.objectStore("feedbacks");
            feedbackStore.add(data);
        }
        request.onupgradeneeded = (e) => {
            var db = e.target.result;
            db.createObjectStore("feedbacks",
                { keyPath: "timestamp" }
            );
        }
        navigator.serviceWorker.ready
        .then(function (swReg) {
                swReg.showNotification("🙄⌚⌛ Your feedback is sending")
                swReg.sync.register(email)
        })
        .catch(function (err) {
            console.log(err);
        })
    }
});

