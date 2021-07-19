const modeButtons = document.querySelectorAll('.player-selection .btn');
let players = [];
let currentPlayer = null;
let mode = '';
let amountOfQuestions = 0;
let transitionTimer = 0;
let questions = [];
let correctAnswer = '';
let player1Score = document.querySelector('.player1 .score');
let player2Score = document.querySelector('.player2 .score');
let resetBtn = document.querySelector('.reset-btn');
let clicked = false;
let modeSelected = false;

modeButtons[0].addEventListener('click', selectMode);
modeButtons[1].addEventListener('click', selectMode);
resetBtn.addEventListener('click', backToMenu);

class Player {
    constructor(name, score) {
        this.name = name;
        this.score = 0;
    }
}

function selectMode(e) {
    e.preventDefault();

    const target = e.target;

    mode = target.innerText == '1 Player' ? '1 Player' : '2 Players';

    if (modeSelected === false) {
        if (mode == '1 Player') {
            const player1 = new Player('Player 1');
            players.push(player1);
            amountOfQuestions =  10;
            player1Score.innerText = player1.score;
            player2Score.innerText = '';
            document.querySelector('.scoreboard').style.justifyContent = 'center';
            document.querySelector('.player1').style.display = 'flex';
            document.querySelector('.player1').classList.add('round-borders');
        } else {
            const player1 = new Player('Player 1');
            const player2 = new Player('Player 2');
            players.push(player1, player2);
            amountOfQuestions = 20;
            player1Score.innerText = player1.score;
            player2Score.innerText = player2.score;
            document.querySelector('.player1').style.display = 'flex';
            document.querySelector('.player2').style.display = 'flex';
        }
        document.querySelector('.game-title').classList.add('game-title-small');
        modeSelected = true;
    }

    return requestQuestions();
}


function requestQuestions() {
    if (clicked === false) {
        const API_URL = `https://opentdb.com/api.php?amount=${amountOfQuestions}&category=11&type=multiple&encode=url3986`;

        fetch(API_URL)
        .then(response => response.json())
        .then(data => startGame(data));

        clicked = true;
    }
}

function startGame(data) {
    questions = data.results;

    // Randomly chooses starting player
    currentPlayer = players.sort((a, b) => 0.5 - Math.random());

    document.querySelector('.questions-screen').style.display = 'flex';

    setTimeout(() => {
        document.querySelector('.player-selection').style.display = 'none';
    }, 400);

    handleTurn();
    setQuestion();
    handleTransitionScreen();
    transitionTimer = 1500;
    clicked = false;
}

function setQuestion() {
    if (questions.length > 0 ) {
        correctAnswer = decodeURIComponent(questions[0].correct_answer);
        const incorrectAnswers = questions[0].incorrect_answers;
        const answerButtons = document.querySelectorAll('.questions-screen .btn');
        let question = document.querySelector('.question');
        let answers = incorrectAnswers.concat(correctAnswer);

        // Randomize order of answers
        answers = answers.sort((a, b) => 0.5 - Math.random());

        question.innerText = decodeURIComponent(questions[0].question);

        for (let i = 0; i < answers.length; i++) {
            answerButtons[i].innerText = decodeURIComponent(answers[i]);
            answerButtons[i].addEventListener('click', checkAnswer);
        }

        // Remove used question from the array
        questions.shift();
    } else {
        handleTransitionScreen();
        resetAnswerColor();
    }
}

function checkAnswer(e) {
    const target = e.target;

    if (clicked === false) {
        if (target.innerText == correctAnswer) {
            target.classList.toggle('correct-answer');
            handleScore();
        } else {
            target.classList.toggle('wrong-answer');
        }

        handleTurn();
        handleTransitionScreen();

        // Timeout is used so 'Transition Screen' has time to cover 'Question Screen' before new question appears
        setTimeout(() => {
            setQuestion();
            clicked = false;
        }, transitionTimer + 450);

        clicked = true;
    }
}

function resetAnswerColor() {
    setTimeout(() => {
        document.querySelectorAll('.questions-screen .btn').forEach(btn => 
            btn.classList.remove('correct-answer', 'wrong-answer'));
    }, 450);
}

function handleTurn() {
    let turnTitle = document.querySelector('.turn-title');

    if (players.length > 1) {

        if (currentPlayer === players[0]) {
            currentPlayer = players[1];
        } else {
            currentPlayer = players[0];
        }

        // Timeout is used to give 'Transition Screen' time to cover 'Question Screen' before 'Turn Title' changes
        setTimeout(() => {
            turnTitle.innerText = currentPlayer.name;
        }, transitionTimer + 300);
    } else {
        currentPlayer.name = 'Player 1';
        currentPlayer = players[0];
    }
}

function handleScore() {
    currentPlayer.score++;

    if (currentPlayer.name == 'Player 1' || players.length === 1) {
        player1Score.innerText = currentPlayer.score;
        player1Score.parentElement.classList.add('score-increased');
    } else {
        player2Score.innerText = currentPlayer.score;
        player2Score.parentElement.classList.add('score-increased');
    }

    setTimeout(() => {
        player1Score.parentElement.classList.remove('score-increased');
        player2Score.parentElement.classList.remove('score-increased');
    }, 500);
}

function handleTransitionScreen() {
    const transitionScreen = document.querySelector('.transition-screen');
    const transitionTitle = document.querySelector('.transition-title');

    setTimeout(() => {
        transitionScreen.classList.add('transition-screen-show');
        transitionScreen.classList.remove('transition-screen-hide');
        resetAnswerColor();
    }, transitionTimer);

    if (questions.length > 0) {
        transitionTitle.innerText = `${currentPlayer.name}'s Turn`;
        setTimeout(() => {
            transitionScreen.classList.add('transition-screen-hide');
            transitionScreen.classList.remove('transition-screen-show');
        }, 3000);
    } else {
        transitionTitle.innerText = players.length > 1 ? `Winner: ${handleResults()}` : handleResults();
        resetBtn.style.display = 'block';
    }
}

function handleResults() {
    let winner = '';

    if (players.length > 1) {
        if (players[0].score === players[1].score) {
            winner = 'Draw';
        } else if (players[0].score > players[1].score) {
            winner = players[0].name;
        } else {
            winner = players[1].name;
        }
    } else {
        winner = `You answered correctly to ${players[0].score} questions`;
    }

    return winner;
}

function backToMenu() {
    if (clicked === false) {
        document.querySelector('.transition-screen').classList.add('transition-screen-hide');
        document.querySelector('.game-title').classList.remove('game-title-small');
        document.querySelector('.scoreboard').style.justifyContent = 'space-between';
        document.querySelector('.player1').classList.remove('round-borders');
        document.querySelector('.transition-title').style.innerText = '';
        document.querySelector('.questions-screen').style.display = 'none';
        document.querySelector('.player-selection').style.display = 'flex';
        document.querySelector('.player1').style.display = 'none';
        document.querySelector('.player2').style.display = 'none';
        resetBtn.style.display = 'none';
        transitionTimer = 0;
        players = [];
        mode = '';
        player1Score.innerText = '';
        player2Score.innerText = '';
        modeSelected = false;
        clicked = true;

        setTimeout(() => {
            clicked = false;
        }, 300);
    }
}