const { fillPinyinData } = require('../../data/fill_pinyin');

Page({
    data: {
        questions: [],
        currentQuestion: null,
        currentIndex: 0,
        score: 0,
        selectedOption: '',
        showResult: false,
        isCorrect: false,
        showFinalResult: false,
        totalQuestions: 0,
        correctCount: 0,
        wrongCount: 0
    },

    onLoad() {
        this.initGame();
    },

    initGame() {
        // 随机打乱题目顺序
        const shuffledQuestions = [...fillPinyinData].sort(() => Math.random() - 0.5);
        
        this.setData({
            questions: shuffledQuestions,
            currentQuestion: shuffledQuestions[0],
            currentIndex: 0,
            score: 0,
            selectedOption: '',
            showResult: false,
            isCorrect: false,
            showFinalResult: false,
            totalQuestions: shuffledQuestions.length,
            correctCount: 0,
            wrongCount: 0
        });
    },

    selectOption(e) {
        if (this.data.showResult) return;

        const selectedOption = e.currentTarget.dataset.option;
        const isCorrect = selectedOption === this.data.currentQuestion.missing;

        this.setData({
            selectedOption,
            showResult: true,
            isCorrect,
            score: isCorrect ? this.data.score + 10 : this.data.score,
            correctCount: isCorrect ? this.data.correctCount + 1 : this.data.correctCount,
            wrongCount: !isCorrect ? this.data.wrongCount + 1 : this.data.wrongCount
        });

        // 播放音频反馈
        const audioContext = wx.createInnerAudioContext();
        audioContext.src = isCorrect ? '/assets/audio/correct.mp3' : '/assets/audio/wrong.mp3';
        audioContext.play();
    },

    nextQuestion() {
        const nextIndex = this.data.currentIndex + 1;
        
        if (nextIndex >= this.data.questions.length) {
            this.setData({ showFinalResult: true });
            return;
        }

        this.setData({
            currentIndex: nextIndex,
            currentQuestion: this.data.questions[nextIndex],
            selectedOption: '',
            showResult: false,
            isCorrect: false
        });
    },

    restart() {
        this.initGame();
    }
}); 