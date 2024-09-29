//=============================================================================
// main.js
//=============================================================================

const div = document.getElementById("awaitinput");
const info = document.getElementById("info");
const hideinfo = document.getElementById("hideinfo");
document.addEventListener("DOMContentLoaded", function() {
    div.style.display = "flex";
    PluginManager.setup($plugins);
    hideinfo.addEventListener("click", function(e) {
        info.style.display = "none";
    }, {once: true});
    div.addEventListener("click", function(e) {
        div.style.display = "none";
        info.style.display = "block";
        SceneManager.run(Scene_Boot);
    }, {once: true});
}, {once: true});
