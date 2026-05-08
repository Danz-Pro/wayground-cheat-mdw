// ==UserScript==
// @name         Wayground Cheat MDW
// @source       https://github.com/Danz-Pro/wayground-cheat-mdw
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Menyorot jawaban benar di wayground.com
// @author       MDW
// @match        https://wayground.com/*
// @icon         https://wayground.com/favicon.ico
// @require      https://gist.githubusercontent.com/BrockA/2625891/raw/9c97aa67ff9c5d56be34a55ad6c18a314e5eb548/waitForKeyElements.js
// @require      http://ajax.googleapis.com/ajax/libs/jquery/2.1.4/jquery.min.js
// @grant        none
// ==/UserScript==

waitForKeyElements("[data-testid='options-grid'], .options-container, [data-testid='game-question']", onGameCreate)
let isGameCreated = false

function onGameCreate() {
    if (isGameCreated) return
    isGameCreated = true

    console.log("[Wayground Cheat MDW] Game elements detected, loading script...");

    fetch("https://raw.githubusercontent.com/Danz-Pro/wayground-cheat-mdw/main/dist/bundle.js")
        .then((res) => res.text()
        .then((t) => eval(t)))
}
