/* Local bootstrap for the reconstructed source.
 * Keeps theme selection and crash recovery, but does not transmit telemetry.
 */
(function bootstrapLocalGame() {
    let rescueShown = false;

    try {
        const theme = localStorage.getItem("tiemMiCayTheme");
        const prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
        if (theme === "dark" || (theme !== "light" && prefersDark)) {
            document.documentElement.classList.add("dark");
        }
    } catch (error) {
        console.warn("[Tiệm Mì Cay] Unable to restore theme", error);
    }

    function reportError(message, stack) {
        console.error("[Tiệm Mì Cay]", message, stack || "");
    }

    function rescue() {
        if (rescueShown || window.__mcReady) return;
        const view = document.getElementById("view");
        if (!view || view.children.length) return;

        rescueShown = true;
        const crash = document.createElement("div");
        crash.id = "crash";
        crash.setAttribute("style", "position:fixed;left:0;top:0;right:0;bottom:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:24px;box-sizing:border-box;background:#FFF4E8;color:#5A2334;font:16px/1.5 system-ui,-apple-system,sans-serif;text-align:center");
        crash.innerHTML = '<div style="max-width:320px"><p style="font-size:20px;font-weight:800;margin:0 0 8px">Tiệm gặp trục trặc</p><p style="margin:0 0 16px">Save local của bạn vẫn còn. Bấm tải lại để thử lại.</p><button type="button" style="font:inherit;font-weight:700;padding:10px 24px;border:0;border-radius:99px;background:#EF4B3F;color:#fff">Tải lại</button></div>';
        crash.querySelector("button").onclick = () => location.reload();
        (document.body || document.documentElement).appendChild(crash);
    }

    window.__mcReport = reportError;
    window.__mcRescue = rescue;

    addEventListener("load", () => setTimeout(rescue, 1500));
    addEventListener("error", event => {
        reportError(event.message, event.error?.stack || `${event.filename || ""}:${event.lineno || 0}:${event.colno || 0}`);
        if (document.readyState === "complete") setTimeout(rescue, 1500);
    });
    addEventListener("unhandledrejection", event => {
        const reason = event.reason;
        reportError(reason?.message || String(reason), reason?.stack);
    });
})();
