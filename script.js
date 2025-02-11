document.addEventListener('DOMContentLoaded', () => {
    const htmlCode = document.getElementById('html-code');
    const cssCode = document.getElementById('css-code');
    const jsCode = document.getElementById('js-code');
    const output = document.getElementById('output');
    const consoleOutput = document.getElementById('console-output');
    const livePreviewButton = document.querySelectorAll('.live-preview-button');
    const themeStylesheet = document.getElementById('theme-stylesheet');
    let livePreview = true;

    function updateOutput() {
        const html = htmlCode.value;
        const css = `<style>${cssCode.value}</style>`;
        const js = `<script>
            try {
                ${jsCode.value}
            } catch (error) {
                console.error(error);
            }
        <\/script>`;
        const srcdoc = `${html}${css}${js}`;

        output.srcdoc = srcdoc;
        captureConsoleLogs();
    }

    function captureConsoleLogs() {
        const iframeWindow = output.contentWindow;
        const console = iframeWindow.console;
        iframeWindow.console = {
            log: function(...args) {
                displayConsoleOutput(args, 'log');
                console.log.apply(console, args);
            },
            error: function(...args) {
                displayConsoleOutput(args, 'error');
                console.error.apply(console, args);
            }
        };
    }

    function displayConsoleOutput(args, type) {
        const newLog = document.createElement('div');
        newLog.textContent = args.join(' ');
        newLog.className = type;
        consoleOutput.appendChild(newLog);
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }

    function downloadCode() {
        const zip = new JSZip();
        zip.file("index.html", htmlCode.value);
        zip.file("styles.css", cssCode.value);
        zip.file("script.js", jsCode.value);

        zip.generateAsync({type:"blob"}).then(function(content) {
            saveAs(content, "code.zip");
        });
    }

    window.toggleLivePreview = function() {
        livePreview = !livePreview;
        livePreviewButton.forEach(button => {
            button.textContent = `Live Preview: ${livePreview ? 'On' : 'Off'}`;
        });
    }

    window.toggleTheme = function() {
        if (themeStylesheet.getAttribute('href').includes('prism-tomorrow')) {
            themeStylesheet.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.css');
            document.body.classList.add('light-theme');
        } else {
            themeStylesheet.setAttribute('href', 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism-tomorrow.min.css');
            document.body.classList.remove('light-theme');
        }
    }

    window.saveCode = function() {
        localStorage.setItem('htmlCode', htmlCode.value);
        localStorage.setItem('cssCode', cssCode.value);
        localStorage.setItem('jsCode', jsCode.value);
        alert('Code saved!');
    }

    window.loadCode = function() {
        htmlCode.value = localStorage.getItem('htmlCode') || '';
        cssCode.value = localStorage.getItem('cssCode') || '';
        jsCode.value = localStorage.getItem('jsCode') || '';
        updateOutput();
        alert('Code loaded!');
    }

    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
            if (livePreview) {
                updateOutput();
            }
        });
    });

    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.editor').forEach(editor => editor.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
        });
    });

    function handleKeyShortcuts(event) {
        if (event.ctrlKey && event.key === 'r') {
            event.preventDefault();
            updateOutput();
        } else if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveCode();
        } else if (event.ctrlKey && event.key === 'l') {
            event.preventDefault();
            loadCode();
        } else if (event.ctrlKey && event.key === 't') {
            event.preventDefault();
            toggleTheme();
        }
    }

    document.addEventListener('keydown', handleKeyShortcuts);

    updateOutput();
});