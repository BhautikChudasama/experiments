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

const CACHE_NAME = "bhau-tk";
const CACHE_VERSION = "1.0.0";
const NAME = CACHE_NAME + " " + CACHE_VERSION;
const STATIC_CACHE = ["/", "app.js", "style.css", "sw.js"];

self.addEventListener("install", event => {
    event.waitUntil(
        caches
        .open("bhautik")
        .then(cache => {
            return cache.addAll(STATIC_CACHE);
        })
        .catch(err => {
            console.log("Error in opening cache!" + err);
        })
    );
});

self.addEventListener("sync", function (event) {
    var request = self.indexedDB.open("feedback-sync", 1);
    console.log("Success!");
    request.onsuccess = event => {
        console.log("success");
        var db = event.target.result;
        var feedbackTrx = db.transaction("feedbacks");
        var feedbackStore = feedbackTrx.objectStore("feedbacks");
        var feedbackCursor = feedbackStore.openCursor();
        feedbackCursor.onsuccess = event => {
            var cursor = event.target.result;
            if (!cursor) return;
            var fb = {
                fb: {
                    e: null,
                    f: null
                }
            };
            fb.fb.e = cursor.value.email;
            fb.fb.f = cursor.value.feedback;
            var sendJSONData = JSON.stringify(fb);
            fetch("https://experimentwithbhautik-backgroundsync.glitch.me/insert", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: sendJSONData
                })
                .then(res => {
                    console.log("Sent");
                    self.registration.showNotification("✅🙌🏻😎😎 Your feedback sent");
                    return Promise.resolve();
                })
                .catch(err => {
                    console.log("Err!");
                    return Promise.reject();
                });
        };
        feedbackCursor.onerror = event => {};
    };
});