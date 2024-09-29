//=============================================================================
// main.js
//=============================================================================

const awaitinput = document.getElementById("awaitinput");
const info = document.getElementById("info");
const hideinfo = document.getElementById("hideinfo");
document.addEventListener("DOMContentLoaded", function() {
    awaitinput.style.display = "flex";
    PluginManager.setup($plugins);
    hideinfo.addEventListener("click", function() {
        info.style.display = "none";
    }, {once: true});
    awaitinput.addEventListener("click", function() {
        awaitinput.style.display = "none";
        info.style.display = "block";
        SceneManager.run(Scene_Boot);
    }, {once: true});
}, {once: true});
