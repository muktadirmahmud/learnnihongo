const DataLoader = {
    registry: {},
    register(level, lessonNum, data) {
        this.registry[`${level}-l${String(lessonNum).padStart(2, '0')}`] = data;
    },
    async loadLesson(level, lessonNum) {
        const key = `${level}-l${String(lessonNum).padStart(2, '0')}`;
        if (this.registry[key]) return this.registry[key];
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `data/${level}/lesson${String(lessonNum).padStart(2, '0')}.js`;
            script.onload = () => resolve(this.registry[key]);
            script.onerror = () => reject(new Error(`Failed to load ${key}`));
            document.head.appendChild(script);
        });
    }
};
