const App = {
    init() {
        Progress.init(); this.setupTheme();
        document.getElementById('back-btn').onclick = () => history.back();
        window.addEventListener('popstate', (e) => { if (e.state?.view) this.navigate(e.state.view, true); });
        this.navigate('home');
    },
    setupTheme() {
        const t = document.getElementById('theme-toggle');
        const cur = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', cur); t.textContent = cur === 'dark' ? '☀️' : '🌙';
        t.onclick = () => {
            const n = document.body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', n); localStorage.setItem('theme', n);
            t.textContent = n === 'dark' ? '☀️' : '🌙';
        };
    },
    navigate(view, isPop = false) {
        if (!isPop) history.pushState({ view }, '', `#${view}`);
        document.getElementById('back-btn').classList.toggle('hidden', view === 'home');
        document.getElementById('header-title').textContent = view === 'home' ? '日本語' : view;
        
        if (view === 'home') this.renderHome();
        else if (view === 'levels') this.renderLevels();
        else if (view.startsWith('lessons-')) this.renderLessons(view.split('-')[1]);
        else if (view.startsWith('study-')) this.renderStudy(view.split('-')[1], parseInt(view.split('-')[2]));
        else if (view === 'review') this.renderReview();
    },
    renderHome() {
        const stats = Object.values(Progress.data);
        document.getElementById('app-container').innerHTML = `
            <button class="btn" onclick="App.navigate('levels')">Vocabulary (N5/N4)</button>
            <button class="btn" onclick="App.navigate('review')">Review Mistakes</button>
            <button class="btn" disabled style="opacity:0.5">Grammar (Coming Soon)</button>
            <div class="card"><h3>Progress</h3><p>Studied: ${stats.length} words</p><p>Mastered (80%+): ${stats.filter(s => s.mastery >= 80).length}</p></div>
        `;
    },
    renderLevels() {
        document.getElementById('app-container').innerHTML = `
            <button class="btn" onclick="App.navigate('lessons-n5')">N5 (Lessons 1-25)</button>
            <button class="btn" onclick="App.navigate('lessons-n4')">N4 (Lessons 26-50)</button>
            <button class="btn" disabled style="opacity:0.5">N3 (Coming Soon)</button>
        `;
    },
    renderLessons(level) {
        const max = level === 'n5' ? 25 : 50, min = level === 'n5' ? 1 : 26;
        let btns = '';
        for (let i = min; i <= max; i++) btns += `<button class="btn" onclick="App.navigate('study-${level}-${i}')">Lesson ${i}</button>`;
        document.getElementById('app-container').innerHTML = `<h2>${level.toUpperCase()}</h2>${btns}`;
    },
    async renderStudy(level, num) {
        document.getElementById('app-container').innerHTML = '<p>Loading...</p>';
        try {
            const w = await DataLoader.loadLesson(level, num);
            const key = `${level}-l${String(num).padStart(2, '0')}`;
            document.getElementById('app-container').innerHTML = `
                <button class="btn" onclick="QuizEngine.start([...DataLoader.registry['${key}']], 'jp-to-bn')">Quiz (JP → BN)</button>
                <button class="btn" onclick="QuizEngine.start([...DataLoader.registry['${key}']], 'bn-to-jp')">Quiz (BN → JP)</button>
                ${w.map(v => `<div class="card">
                    <div class="jp-text">${v.japanese}</div>
                    <div class="romaji">${v.romaji}</div>
                    <div class="bangla">${v.bangla}</div>
                    ${v.kanji ? `<small style="color:#888">Kanji: ${v.kanji}</small>` : ''}
                    ${v.example ? `<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--border)"><b>Ex:</b> ${v.example.japanese}<br><small>(${v.example.bangla})</small></div>` : ''}
                </div>`).join('')}
            `;
        } catch(e) { document.getElementById('app-container').innerHTML = '<div class="card">Lesson data missing or failed to load.</div>'; }
    },
    async renderReview() {
        document.getElementById('app-container').innerHTML = '<p>Loading...</p>';
        const keys = Object.keys(DataLoader.registry);
        // Pre-load all registered lessons if not already loaded
        for (let i=1; i<=50; i++) try { await DataLoader.loadLesson(i<=25?'n5':'n4', i); } catch(e){}
        
        const words = Progress.getReviewWords(Object.keys(DataLoader.registry));
        if (words.length === 0) {
            document.getElementById('app-container').innerHTML = '<div class="card"><h3>No words to review</h3><p>Take quizzes to generate review items.</p></div>';
            return;
        }
        document.getElementById('app-container').innerHTML = `
            <div class="card"><h3>Review Mode</h3><p>You have ${words.length} words to review.</p></div>
            <button class="btn" onclick="QuizEngine.start([...App.shuffle(words.slice(0,20))], 'jp-to-bn')">Review (JP → BN)</button>
        `;
    },
    shuffle(arr) { return arr.sort(() => 0.5 - Math.random()); }
};
document.addEventListener('DOMContentLoaded', () => App.init());
