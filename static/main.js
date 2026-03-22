/* eslint no-console:0 */
/**
 * This is the webpack entry point for the test page.
 */
import katex from "../katex.webpack.js";
import "./main.css";

function init() {
    const input = document.getElementById("input");
    const math = document.getElementById("math");
    const mathContainer = document.getElementById("math-container");
    const renderErrorElement = document.getElementById("render-error");
    const toggleOptionsButton = document.getElementById("toggle-options");
    const optionsToolbar = document.getElementById("options-toolbar");
    const optionsPanel = document.getElementById("options-panel");
    const optionsResizer = document.getElementById("sidebar-resizer");
    const layout = document.querySelector("main");
    const beforeContentElement = document.getElementById("before-content");
    const afterContentElement = document.getElementById("after-content");

    const options = {
        displayMode: true,
        leqno: false,
        fleqn: false,
        throwOnError: true,
        strict: "warn",
        output: "htmlAndMathml",
        trust: true,
        macros: {},
        before: "",
        after: "",
    };

    const minSidebarWidth = 155;
    const maxSidebarWidth = 560;
    const narrowSidebarWidth = 230;
    const minMobileOptionsHeight = 88;
    const maxMobileOptionsHeight = 520;
    const optionsSizeStorageKeyPrefix = "katex-testing-gui-options-size";
    const optionsWidthStorageKey = `${optionsSizeStorageKeyPrefix}-width`;
    const optionsHeightStorageKey = `${optionsSizeStorageKeyPrefix}-height`;
    const legacySidebarWidthStorageKey = "katex-testing-gui-sidebar-width";
    const legacyMobileOptionsHeightStorageKey =
        "katex-testing-gui-mobile-options-height";

    let permalinkData = {};
    let isResizing = false;
    let resizeStartClientX = 0;
    let resizeStartClientY = 0;
    let resizeStartSidebarWidth = minSidebarWidth;
    let resizeStartMobileOptionsHeight = minMobileOptionsHeight;

    function isMobileViewport() {
        return window.matchMedia("(max-width: 900px)").matches;
    }

    function getClampedSidebarWidth(width) {
        const layoutWidth = layout.getBoundingClientRect().width;
        const maximumWidth = Math.min(
            maxSidebarWidth,
            Math.max(minSidebarWidth, layoutWidth * 0.55),
        );

        return Math.max(minSidebarWidth, Math.min(maximumWidth, width));
    }

    function setSidebarWidth(width, shouldPersist) {
        const clampedWidth = getClampedSidebarWidth(width);
        layout.style.setProperty("--sidebar-width", `${clampedWidth}px`);
        syncSidebarWidthMode();

        if (!shouldPersist) {
            return;
        }

        try {
            window.localStorage.setItem(
                optionsWidthStorageKey,
                String(Math.round(clampedWidth)),
            );
        } catch {
            // Ignore storage failures (private mode, disabled storage, etc.).
        }
    }

    function getClampedMobileOptionsHeight(height) {
        const viewportHeight = window.innerHeight;
        const maximumHeight = Math.min(
            maxMobileOptionsHeight,
            Math.max(minMobileOptionsHeight, viewportHeight * 0.75),
        );

        return Math.max(
            minMobileOptionsHeight,
            Math.min(maximumHeight, height),
        );
    }

    function setMobileOptionsHeight(height, shouldPersist) {
        const clampedHeight = getClampedMobileOptionsHeight(height);
        layout.style.setProperty(
            "--mobile-options-height",
            `${clampedHeight}px`,
        );
        syncSidebarWidthMode();

        if (!shouldPersist) {
            return;
        }

        try {
            window.localStorage.setItem(
                optionsHeightStorageKey,
                String(Math.round(clampedHeight)),
            );
        } catch {
            // Ignore storage failures (private mode, disabled storage, etc.).
        }
    }

    function getCurrentSidebarWidth() {
        const rawValue =
            getComputedStyle(layout).getPropertyValue("--sidebar-width");
        const width = parseFloat(rawValue);

        return Number.isFinite(width) ? width : minSidebarWidth;
    }

    function getCurrentMobileOptionsHeight() {
        const rawValue = getComputedStyle(layout).getPropertyValue(
            "--mobile-options-height",
        );
        const height = parseFloat(rawValue);

        return Number.isFinite(height) ? height : minMobileOptionsHeight;
    }

    function syncOptionsPanelState() {
        const isCollapsed = optionsPanel.classList.contains("collapsed");

        layout.classList.toggle("options-collapsed", isCollapsed);
        toggleOptionsButton.setAttribute("aria-expanded", String(!isCollapsed));
        toggleOptionsButton.setAttribute(
            "aria-label",
            isCollapsed ? "Show options" : "Hide options",
        );
        optionsResizer.setAttribute("aria-hidden", String(isCollapsed));
        optionsResizer.tabIndex = isCollapsed ? -1 : 0;
        syncSidebarWidthMode();
    }

    function syncSidebarWidthMode() {
        const isMobile = isMobileViewport();
        const isCollapsed = optionsPanel.classList.contains("collapsed");
        const isNarrow = getCurrentSidebarWidth() < narrowSidebarWidth;

        optionsResizer.setAttribute(
            "aria-orientation",
            isMobile ? "horizontal" : "vertical",
        );

        layout.classList.toggle(
            "sidebar-narrow",
            !isMobile && !isCollapsed && isNarrow,
        );
    }

    function toggleOptionsPanel() {
        optionsPanel.classList.toggle("collapsed");
        syncOptionsPanelState();
    }

    function clearRenderError() {
        mathContainer.classList.remove("has-error");
        renderErrorElement.textContent = "";
    }

    function showRenderError(errorMessage) {
        mathContainer.classList.add("has-error");
        renderErrorElement.textContent = errorMessage;
    }

    function startResizing(event) {
        if (optionsPanel.classList.contains("collapsed")) {
            return;
        }

        isResizing = true;
        resizeStartClientX = event.clientX;
        resizeStartClientY = event.clientY;
        resizeStartSidebarWidth = getCurrentSidebarWidth();
        resizeStartMobileOptionsHeight = getCurrentMobileOptionsHeight();
        document.body.classList.add("is-resizing");
        optionsResizer.setPointerCapture(event.pointerId);
        event.preventDefault();
    }

    function resizeSidebar(event) {
        if (!isResizing) {
            return;
        }

        if (isMobileViewport()) {
            const deltaY = event.clientY - resizeStartClientY;
            setMobileOptionsHeight(
                resizeStartMobileOptionsHeight + deltaY,
                false,
            );
            return;
        }

        const deltaX = event.clientX - resizeStartClientX;
        setSidebarWidth(resizeStartSidebarWidth + deltaX, false);
    }

    function stopResizing(event) {
        if (!isResizing) {
            return;
        }

        isResizing = false;
        document.body.classList.remove("is-resizing");

        if (isMobileViewport()) {
            setMobileOptionsHeight(getCurrentMobileOptionsHeight(), true);
        } else {
            setSidebarWidth(getCurrentSidebarWidth(), true);
        }

        if (optionsResizer.hasPointerCapture(event.pointerId)) {
            optionsResizer.releasePointerCapture(event.pointerId);
        }
    }

    optionsToolbar.addEventListener("click", toggleOptionsPanel);

    optionsResizer.addEventListener("pointerdown", startResizing);
    optionsResizer.addEventListener("pointermove", resizeSidebar);
    optionsResizer.addEventListener("pointerup", stopResizing);
    optionsResizer.addEventListener("pointercancel", stopResizing);
    optionsResizer.addEventListener("keydown", (event) => {
        if (optionsPanel.classList.contains("collapsed")) {
            return;
        }

        const step = event.shiftKey ? 32 : 14;

        if (isMobileViewport()) {
            if (event.key === "ArrowDown") {
                setMobileOptionsHeight(
                    getCurrentMobileOptionsHeight() + step,
                    true,
                );
                event.preventDefault();
                return;
            }

            if (event.key === "ArrowUp") {
                setMobileOptionsHeight(
                    getCurrentMobileOptionsHeight() - step,
                    true,
                );
                event.preventDefault();
            }

            return;
        }

        if (event.key === "ArrowRight") {
            setSidebarWidth(getCurrentSidebarWidth() + step, true);
            event.preventDefault();
            return;
        }

        if (event.key === "ArrowLeft") {
            setSidebarWidth(getCurrentSidebarWidth() - step, true);
            event.preventDefault();
        }
    });

    window.addEventListener("resize", () => {
        if (isMobileViewport()) {
            setMobileOptionsHeight(getCurrentMobileOptionsHeight(), false);
            return;
        }

        setSidebarWidth(getCurrentSidebarWidth(), false);
    });

    try {
        const storedSidebarWidth = parseFloat(
            window.localStorage.getItem(optionsWidthStorageKey) ||
                window.localStorage.getItem(legacySidebarWidthStorageKey),
        );

        if (Number.isFinite(storedSidebarWidth)) {
            setSidebarWidth(storedSidebarWidth, false);
        }
    } catch {
        // Ignore storage failures (private mode, disabled storage, etc.).
    }

    try {
        const storedMobileOptionsHeight = parseFloat(
            window.localStorage.getItem(optionsHeightStorageKey) ||
                window.localStorage.getItem(
                    legacyMobileOptionsHeightStorageKey,
                ),
        );

        if (Number.isFinite(storedMobileOptionsHeight)) {
            setMobileOptionsHeight(storedMobileOptionsHeight, false);
        }
    } catch {
        // Ignore storage failures (private mode, disabled storage, etc.).
    }

    if (isMobileViewport()) {
        optionsPanel.classList.add("collapsed");
        setMobileOptionsHeight(getCurrentMobileOptionsHeight(), false);
    }

    syncOptionsPanelState();
    input.addEventListener("input", reprocess, options);

    function updatePermalink() {
        const data = Object.assign({}, options, {code: input.value});
        const encodedData = encodeURIComponent(JSON.stringify(data));
        window.history.replaceState({}, "", `?data=${encodedData}`);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const data = urlParams.get("data");

    if (data) {
        try {
            permalinkData = JSON.parse(data);
        } catch (e) {
            console.warn(e);
        }
    }

    if (permalinkData.code) {
        input.value = permalinkData.code;
    }

    for (const id in options) {
        if (!options.hasOwnProperty(id)) {
            continue;
        }

        const element = document.getElementById(id);
        if (!element) {
            continue;
        }

        if (element.type === "checkbox") {
            element.addEventListener("change", () => {
                const key = element.id;
                options[key] = element.checked;
            });
            element.checked = permalinkData[id] ?? options[id];
            options[id] = element.checked;
        }

        if (element.type === "select-one") {
            element.addEventListener("change", () => {
                const key = element.id;
                options[key] = element.value;
            });
            element.value = permalinkData[id] ?? options[id];
            options[id] = element.value;
        }

        if (element.type === "textarea") {
            if (permalinkData[id]) {
                element.value = JSON.stringify(permalinkData[id], null, 4);
                options[id] = permalinkData[id];
            } else {
                id === "macros"
                    ? (options[id] = JSON.parse(element.value))
                    : (options[id] = element.value);
            }

            element.addEventListener("change", () => {
                const key = element.id;
                key === "macros"
                    ? (options[key] = JSON.parse(element.value))
                    : (options[key] = element.value);
            });
        }

        element.addEventListener("change", reprocess);
    }

    if (permalinkData.before) {
        beforeContentElement.innerText = permalinkData.before;
        options.before = permalinkData.before;
    }

    if (permalinkData.after) {
        afterContentElement.innerText = permalinkData.after;
        options.after = permalinkData.after;
    }

    reprocess();

    function reprocess() {
        try {
            katex.render(input.value, math, options);
            clearRenderError();
            beforeContentElement.innerText = options.before || "";
            afterContentElement.innerText = options.after || "";
        } catch (e) {
            console.error(e);
            math.textContent = "";
            beforeContentElement.innerText = "";
            afterContentElement.innerText = "";
            showRenderError(e?.message || "unknown error");
        }

        updatePermalink();
    }

    if (module.hot) {
        module.hot.accept("../katex.webpack.js", reprocess);
    }
}

init();

export default katex;
