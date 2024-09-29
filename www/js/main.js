//=============================================================================
// main.js
//=============================================================================

const div = document.getElementById("awaitinput");
document.addEventListener("DOMContentLoaded", function() {
    div.style.display = "flex";
    PluginManager.setup($plugins);
    div.addEventListener("click", function(e) {
        div.style.display = "none";
        SceneManager.run(Scene_Boot);
    }, {once: true});
}, {once: true});
