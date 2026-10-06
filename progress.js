const Progress = {
    KEY: 'japanese_app_progress_v1', data: {},
    init() { const s = localStorage.getItem(this.KEY); this.data = s ? JSON.parse(s) : {}; },
    save() { localStorage.setItem(this.KEY, JSON.stringify(this.data)); },
    getStats(id) {
        if (!this.data[id]) this.data[id] = { attempts: 0, correct: 0, wrong: 0, mastery: 0, lastReviewed: null };
        return this.data[id];
    },
    recordAnswer(id, isCorrect) {
        const s = this.getStats(id);
        s.attempts += 1;
        if (isCorrect) s.correct += 1; else s.wrong += 1;
        s.mastery = (s.correct / s.attempts) * 100;
        s.lastReviewed = new Date().toISOString();
        this.save();
    },
    getReviewWords(keys) {
        let res = [];
        keys.forEach(k => DataLoader.registry[k]?.forEach(w => {
            const s = this.getStats(w.id);
            if (s.mastery < 80 && s.attempts > 0) res.push(w);
        }));
        return res;
    }
};
