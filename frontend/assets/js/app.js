/**
 * Set API URL
 */
const API_BASE = 'API_URL';


/**
 * Set Button Listeners
 */
document.getElementById('start-button').addEventListener('click', () => {
  getQuestionnaireType().then(res => navigateToQuestionnaire(res));
});


document.getElementById('next-page-button').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    nextPage();
});

document.getElementById('prev-page-button').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    prevPage();
});

document.getElementById('submit-button').addEventListener('click', () => {
    submitQuestionnaire().then(res => {
        showScorePage(res);
    });
});


/**
 * Set Variables & Constants
 */
let questionnaireType = null;
let currentPage = 0;
const pages = ['questionnaire-page-1', 'questionnaire-page-2', 'questionnaire-page-3', 'questionnaire-page-4', 'questionnaire-page-5', 'questionnaire-page-6'];

/**
 * Page Manipulation
 */
function pageVisibility(docId, visibilityType) {
    document.getElementById(docId).style.display = visibilityType;
}

function showScorePage(res) {
    currentPage = pages.length;
    setScore(document.querySelectorAll('.score-container')[0], res.avgScore);
    setScore(document.querySelectorAll('.score-container')[1], res.aiScore);
    setScore(document.querySelectorAll('.score-container')[2], res.legitimacyScore);
    updateNavElements();
    updateQuestionnairePage();
    pageVisibility('score-page', 'block');
}

/**
 * Questionnaire Page & Navigation Manipulation
 */
function nextPage() {
    console.log('CurrentPage before:', currentPage);
    if (currentPage < pages.length - 1 && checkPageFields()) {
        currentPage++;
        console.log('CurrentPage after:', currentPage);
        updateNavElements();
        updateQuestionnairePage();
    } else {
        console.log('Next blocked. CurrentPage:', currentPage, 'Validation:', checkPageFields());
    }
}

function prevPage() {
    if (currentPage > 0) {
        currentPage--;
        updateNavElements();
        updateQuestionnairePage();
    }
}

function navigateToQuestionnaire(res) {
    switch (questionnaireType) {
        case null: alert("Something went wrong. Please try again later.");
        break;
        case -1: {
            pageVisibility('landing-page', 'none');
            showScorePage(res);
        }
        break;
        default: {
            pageVisibility('landing-page', 'none');
            updateImages();
            updateNavElements();
            updateQuestionnairePage();
        }
    }
}

function updateQuestionnairePage() {
    let count = 0;
    pages.forEach(page => {
        pageVisibility(page, (count === currentPage) ? 'block' : 'none');
        count++;
    });
}

function updateNavElements() {
    const progress = (currentPage / (pages.length - 1)) * 100;
    const progressBarDiv = document.getElementById('progress-bar-div');
    const progressBarText = document.getElementById('progress-bar-text');
    const progressBar = document.getElementById('progress-bar');
    const nextButton  = document.getElementById('next-page-button');
    const prevButton = document.getElementById('prev-page-button');
    const submitButton = document.getElementById('submit-button');

    progressBarText.innerText = 'Page ' + (currentPage + 1) + ' of ' + (pages.length);
    progressBar.style.width = progress + '%';

    switch (currentPage) {
        case 0: {
            nextButton.style.display = 'block';
            prevButton.style.display = 'none';
            submitButton.style.display = 'none';

            progressBarDiv.style.display = 'block';
        }
            break;
        case (pages.length - 1): {
            nextButton.style.display = 'none';
            prevButton.style.display = 'block';
            submitButton.style.display = 'block';

            progressBarDiv.style.display = 'block';
        }
            break;
        case pages.length: {
            nextButton.style.display = 'none';
            prevButton.style.display = 'none';
            submitButton.style.display = 'none';

            progressBarDiv.style.display = 'none';
        }
            break;
        default: {
            nextButton.style.display = 'block';
            prevButton.style.display = 'block';
            submitButton.style.display = 'none';

            progressBarDiv.style.display = 'block';
        }
    }
}

/**
 * API Calls
 */
async function getQuestionnaireType() {
    try {
        let token = localStorage.getItem('questionnaireToken');
        let query = (token != null) ? `?token=${token}` : '';

        const response = await fetch(`${API_BASE}/api/questionnaire-type${query}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
        });

        const result = await response.json();
        if (token == null || token === "undefined") localStorage.setItem('questionnaireToken', result['token']);
        if (result['type'] === 0 || result['type'] === 1 || result['type'] === -1) questionnaireType = result['type'];
        return result
    } catch (error) {
        alert("Something went wrong. Please try again later.");
        console.error('Error submitting questionnaire:', error);
        return null
    }
}

const result = await response.json();

if (token == null || token === "undefined") {
  localStorage.setItem('questionnaireToken', result.token);
}

if (result.type === 0 || result.type === 1 || result.type === -1) {
  localStorage.setItem('questionnaireType', result.type);
  questionnaireType = result.type;
}


async function submitQuestionnaire() {
    const answers = collectAnswers();
    const language = localStorage.getItem('selectedLanguage') || 'en'; 
    try {
        const response = await fetch(`${API_BASE}/api/submit-questionnaire`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: questionnaireType,
                token: localStorage.getItem('questionnaireToken'),
                answers: answers,
                language: language
            })
        });

        return await response.json();
    } catch (error) {
        alert("Something went wrong. Please try again later.");
        return null
    }
}

/**
 * Helper Functions
 */
function updateImages() {
    const imageMappings = {
        0: [
            'assets/img/qa_873287230912.png',
            'assets/img/qa_127832199313.png',
            'assets/img/qa_874383402111.png',
            'assets/img/qa_903487213876.png',
            'assets/img/qa_42783211245.png',
        ],
        1: [
            'assets/img/qb_12739279982.png',
            'assets/img/qb_98436015302.png',
            'assets/img/qb_83724909137.png',
            'assets/img/qb_98324013200.png',
            'assets/img/qa_42783211245.png',
        ]
    };

    const images = [
        'email1-image', 'email2-image', 'email3-image', 'email4-image', 'email5-image'
    ];

    const sources = imageMappings[questionnaireType] || imageMappings[0];

    images.forEach((id, index) => {
        const img = document.getElementById(id);
        if (img) img.src = sources[index];
    });
}

function toggleOtherInput() {
    const otherInput = document.getElementById('otherInput');
    if (document.getElementById('other').checked) {
        otherInput.style.display = 'block';
    } else {
        otherInput.style.display = 'none';
    }
}

function setScore(element, score) {
    const scoreCircle = element.querySelector('.score-circle');
    const scoreText = element.querySelector('.score-text');

    scoreText.textContent = score.toFixed(1);

    

    // Determine and set stroke and stroke color
    let color;
    if (score < 5) {
        color = '#FF4040';
    } else if (score < 7) {
        color = 'yellow';
    } else {
        color = '#3cf7b7';
    }

    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 10) * circumference;

    scoreCircle.style.stroke = color;
    scoreCircle.style.strokeDasharray = `${circumference - offset} ${offset}`;
}

function collectAnswers() {
    return {
        personalInfo: {
            gender: document.getElementById('gender').value,
            age: document.getElementById('age1').value,
            education: document.getElementById('education1').value,
            englishProficiency: document.getElementById('english1').value,
            role: document.getElementById('role1').value
        },
        email1: {
            legitimacyScore: document.getElementById('email1-legitimacy-score').value,
            aiScore: document.getElementById('email1-ai-score').value,
            legitAspects: {
                presentation: document.getElementById('email1-legit-presentation').checked,
                grammar: document.getElementById('email1-legit-grammar').checked,
                url: document.getElementById('email1-legit-url').checked,
                tone: document.getElementById('email1-legit-tone').checked,
                nothing: document.getElementById('email1-legit-nothing').checked,
                other: document.getElementById('email1-legit-other').checked ? document.getElementById('email1-legit-otherInput').value : ''
            },
            illegitAspects: {
                presentation: document.getElementById('email1-illegit-presentation').checked,
                grammar: document.getElementById('email1-illegit-grammar').checked,
                url: document.getElementById('email1-illegit-url').checked,
                tone: document.getElementById('email1-illegit-tone').checked,
                nothing: document.getElementById('email1-illegit-nothing').checked,
                other: document.getElementById('email1-illegit-other').checked ? document.getElementById('email1-illegit-otherInput').value : ''
            },
            explanation: document.getElementById('email1-explanation').value
        },
        email2: {
            legitimacyScore: document.getElementById('email2-legitimacy-score').value,
            aiScore: document.getElementById('email2-ai-score').value,
            legitAspects: {
                presentation: document.getElementById('email2-legit-presentation').checked,
                grammar: document.getElementById('email2-legit-grammar').checked,
                url: document.getElementById('email2-legit-url').checked,
                tone: document.getElementById('email2-legit-tone').checked,
                nothing: document.getElementById('email2-legit-nothing').checked,
                other: document.getElementById('email2-legit-other').checked ? document.getElementById('email2-legit-otherInput').value : ''
            },
            illegitAspects: {
                presentation: document.getElementById('email2-illegit-presentation').checked,
                grammar: document.getElementById('email2-illegit-grammar').checked,
                url: document.getElementById('email2-illegit-url').checked,
                tone: document.getElementById('email2-illegit-tone').checked,
                nothing: document.getElementById('email2-illegit-nothing').checked,
                other: document.getElementById('email2-illegit-other').checked ? document.getElementById('email2-illegit-otherInput').value : ''
            },
            explanation: document.getElementById('email2-explanation').value
        },
        email3: {
            legitimacyScore: document.getElementById('email3-legitimacy-score').value,
            aiScore: document.getElementById('email3-ai-score').value,
            legitAspects: {
                presentation: document.getElementById('email3-legit-presentation').checked,
                grammar: document.getElementById('email3-legit-grammar').checked,
                url: document.getElementById('email3-legit-url').checked,
                tone: document.getElementById('email3-legit-tone').checked,
                nothing: document.getElementById('email3-legit-nothing').checked,
                other: document.getElementById('email3-legit-other').checked ? document.getElementById('email3-legit-otherInput').value : ''
            },
            illegitAspects: {
                presentation: document.getElementById('email3-illegit-presentation').checked,
                grammar: document.getElementById('email3-illegit-grammar').checked,
                url: document.getElementById('email3-illegit-url').checked,
                tone: document.getElementById('email3-illegit-tone').checked,
                nothing: document.getElementById('email3-illegit-nothing').checked,
                other: document.getElementById('email3-illegit-other').checked ? document.getElementById('email3-illegit-otherInput').value : ''
            },
            explanation: document.getElementById('email3-explanation').value
        },
        email4: {
            legitimacyScore: document.getElementById('email4-legitimacy-score').value,
            aiScore: document.getElementById('email4-ai-score').value,
            legitAspects: {
                presentation: document.getElementById('email4-legit-presentation').checked,
                grammar: document.getElementById('email4-legit-grammar').checked,
                url: document.getElementById('email4-legit-url').checked,
                tone: document.getElementById('email4-legit-tone').checked,
                nothing: document.getElementById('email4-legit-nothing').checked,
                other: document.getElementById('email4-legit-other').checked ? document.getElementById('email4-legit-otherInput').value : ''
            },
            illegitAspects: {
                presentation: document.getElementById('email4-illegit-presentation').checked,
                grammar: document.getElementById('email4-illegit-grammar').checked,
                url: document.getElementById('email4-illegit-url').checked,
                tone: document.getElementById('email4-illegit-tone').checked,
                nothing: document.getElementById('email4-illegit-nothing').checked,
                other: document.getElementById('email4-illegit-other').checked ? document.getElementById('email4-illegit-otherInput').value : ''
            },
            explanation: document.getElementById('email4-explanation').value
        },
        email5: {
            legitimacyScore: document.getElementById('email5-legitimacy-score').value,
            aiScore: document.getElementById('email5-ai-score').value,
            legitAspects: {
                presentation: document.getElementById('email5-legit-presentation').checked,
                grammar: document.getElementById('email5-legit-grammar').checked,
                url: document.getElementById('email5-legit-url').checked,
                tone: document.getElementById('email5-legit-tone').checked,
                nothing: document.getElementById('email5-legit-nothing').checked,
                other: document.getElementById('email5-legit-other').checked ? document.getElementById('email5-legit-otherInput').value : ''
            },
            illegitAspects: {
                presentation: document.getElementById('email5-illegit-presentation').checked,
                grammar: document.getElementById('email5-illegit-grammar').checked,
                url: document.getElementById('email5-illegit-url').checked,
                tone: document.getElementById('email5-illegit-tone').checked,
                nothing: document.getElementById('email5-illegit-nothing').checked,
                other: document.getElementById('email5-illegit-other').checked ? document.getElementById('email5-illegit-otherInput').value : ''
            },
            explanation: document.getElementById('email5-explanation').value
        }
    };
}

function checkPageFields() {
    const pageId = `questionnaire-page-${currentPage + 1}`;
    const page = document.getElementById(pageId);
    let allFieldsFilled = true;

    console.log(`Checking fields for page: ${pageId}`);

    page.querySelectorAll('.form-group').forEach(group => {
        // Logging for select elements
        const select = group.querySelector('select');
        if (select && !select.value) {
            console.error('Select field empty:', select.id);
            allFieldsFilled = false;
        }

        // Logging for range inputs
        const range = group.querySelector('input[type="range"]');
        if (range && range.value === '') {
            console.error('Range input not set:', range.id);
            allFieldsFilled = false;
        }

        // Logging for checkboxes
        const checkboxes = group.querySelectorAll('input[type="checkbox"]');
        if (checkboxes.length > 0 && !Array.from(checkboxes).some(c => c.checked)) {
            console.error('No checkboxes checked in group:', group);
            allFieldsFilled = false;
        }
    });

    console.log(`All fields filled: ${allFieldsFilled}`);
    return allFieldsFilled;
}