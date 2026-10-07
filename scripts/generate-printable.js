const fs = require('fs');
const { marked } = require('marked');

const filesToConvert = ['README.md', 'WORKFLOW.md'];

const htmlTemplate = (title, content) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>` + title + `</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.2.0/github-markdown.min.css">
    <style>
        body {
            box-sizing: border-box;
            min-width: 200px;
            max-width: 980px;
            margin: 0 auto;
            padding: 45px;
        }
        @media print {
            body {
                padding: 0;
            }
        }
        .mermaid {
            display: flex;
            justify-content: center;
            margin: 20px 0;
        }
    </style>
</head>
<body class="markdown-body">
    ` + content + `
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
    </script>
</body>
</html>
`;

filesToConvert.forEach(file => {
    if (fs.existsSync(file)) {
        const md = fs.readFileSync(file, 'utf8');
        
        marked.setOptions({ });
        
        const htmlContent = marked.parse(md);
        
        // We will inject a client-side script to convert the <pre><code class="language-mermaid"> into <div class="mermaid">
        const finalHtml = htmlTemplate(file.replace('.md', ''), htmlContent).replace('mermaid.initialize({ startOnLoad: true, theme: \'default\' });', `
        document.querySelectorAll('pre code.language-mermaid').forEach((block) => {
            const div = document.createElement('div');
            div.className = 'mermaid';
            div.textContent = block.textContent;
            block.parentElement.replaceWith(div);
        });
        mermaid.initialize({ startOnLoad: true, theme: 'default' });
        `);
        
        const outFileName = file.replace('.md', '.html');
        fs.writeFileSync(outFileName, finalHtml);
        console.log('Successfully generated ' + outFileName);
    } else {
        console.log('File ' + file + ' not found.');
    }
});
