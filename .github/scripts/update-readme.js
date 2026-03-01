import fs from 'fs';
import path from 'path';

const README_PATH = path.join(process.cwd(), 'README.md');
const JOURNALS_DIR = path.join(process.cwd(), 'journals');

function getCount() {
    if (!fs.existsSync(JOURNALS_DIR)) return 0;
    return fs.readdirSync(JOURNALS_DIR).filter(f => f.endsWith('.md') && f !== 'README.md').length;
}

function updateReadme() {
    const count = getCount();
    const date = new Date().toUTCString();

    const content = fs.readFileSync(README_PATH, 'utf8');

    const sectionStart = '<!-- DYNAMIC_SECTION:START -->';
    const sectionEnd = '<!-- DYNAMIC_SECTION:END -->';

    const newSection = `${sectionStart}\n## 🧠 Memory Core Status\n- **Journal Entries Ingested:** ${count}\n- **Last Sync:** ${date}\n${sectionEnd}`;

    const regex = new RegExp(`${sectionStart}[\\s\\S]*?${sectionEnd}`, 'm');

    if (regex.test(content)) {
        const newContent = content.replace(regex, newSection);
        fs.writeFileSync(README_PATH, newContent, 'utf8');
        console.log('README.md successfully updated.');
    } else {
        console.error('Dynamic section markers not found in README.md!');
        process.exit(1);
    }
}

updateReadme();
