const QuizEngine = {
    currentQueue: [], currentIndex: 0, score: 0, mistakes: [], mode: 'jp-to-bn',
    start(words, mode) {
        this.currentQueue = words.sort(() => 0.5 - Math.random());
        this.currentIndex = 0; this.score = 0; this.mistakes = []; this.mode = mode;
        this.renderQuestion();
    },
    getOptions(correct) {
        let pool = Object.values(DataLoader.registry).flat();
        let opts = [correct];
        pool = pool.filter(w => w.id !== correct.id).sort(() => 0.5 - Math.random());
        for (let i = 0; i < 3 && i < pool.length; i++) opts.push(pool[i]);
        return opts.sort(() => 0.5 - Math.random());
    },
    renderQuestion() {
        if (this.currentIndex >= this.currentQueue.length) return this.renderResults();
        const w = this.currentQueue[this.currentIndex];
        const opts = this.getOptions(w);
        const q = this.mode === 'jp-to-bn' ? w.japanese : w.bangla;
        const aKey = this.mode === 'jp-to-bn' ? 'bangla' : 'japanese';
        document.getElementById('app-container').innerHTML = `
            <div class="card"><h3>Question ${this.currentIndex + 1}/${this.currentQueue.length}</h3><div class="jp-text">${q}</div></div>
            ${opts.map(o => `<div class="quiz-option" data-id="${o.id}">${o[aKey]}</div>`).join('')}
        `;
        document.querySelectorAll('.quiz-option').forEach(el => {
            el.onclick = () => this.handleAnswer(el, w, aKey);
        });
    },
    handleAnswer(el, correct, aKey) {
        const isCorrect = el.dataset.id === correct.id;
        Progress.recordAnswer(correct.id, isCorrect);
        if (isCorrect) { el.classList.add('correct'); this.score += 1; }
        else {
            el.classList.add('wrong'); this.mistakes.push(correct);
            document.querySelector(`.quiz-option[data-id="${correct.id}"]`).classList.add('correct');
        }
        document.querySelectorAll('.quiz-option').forEach(o => o.style.pointerEvents = 'none');
        setTimeout(() => { this.currentIndex++; this.renderQuestion(); }, 1200);
    },
    renderResults() {
        const acc = this.currentQueue.length > 0 ? Math.round((this.score / this.currentQueue.length) * 100) : 0;
        document.getElementById('app-container').innerHTML = `
            <div class="card"><h2>Results</h2><p>Score: ${this.score}/${this.currentQueue.length}</p><p>Accuracy: ${acc}%</p></div>
            ${this.mistakes.length ? `<div class="card"><h3>Mistakes</h3>${this.mistakes.map(m => `<p><b>${m.japanese}</b> = ${m.bangla}</p>`).join('')}</div><button class="btn" id="retry">Retry Mistakes</button>` : ''}
            <button class="btn" id="home">Home</button>
        `;
        if(document.getElementById('retry')) document.getElementById('retry').onclick = () => this.start(this.mistakes, this.mode);
        document.getElementById('home').onclick = () => App.navigate('home');
    }
};
