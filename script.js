const db = {
    getStudents: () => {
        return JSON.parse(localStorage.getItem('students')) || [];
    },
    saveStudents: (students) => {
        localStorage.setItem('students', JSON.stringify(students));
    }
};

let isAdminLoggedIn = false;
let welcomeMessageShown = false;

const studentPage = document.getElementById('student-page');
const adminPage = document.getElementById('admin-page');
const pageHeading = document.getElementById('page-heading');

const navStudent = document.getElementById('nav-student');
const navAdmin = document.getElementById('nav-admin');

const resultForm = document.getElementById('result-form');
const searchButton = document.getElementById('search-button');
const studentMessageArea = document.getElementById('student-message-area');
const resultDisplay = document.getElementById('result-display');
const midTermResultContainer = document.getElementById('mid-term-result-container');
const finalTermResultContainer = document.getElementById('final-term-result-container');
const overallResultContainer = document.getElementById('overall-result-container');
const finalSummaryContainer = document.getElementById('final-summary-container');

const addStudentForm = document.getElementById('add-student-form');
const addStudentBtn = document.getElementById('add-student-btn');
const adminStudentMessageArea = document.getElementById('admin-student-message-area');
const addMarksForm = document.getElementById('add-marks-form');
const addMarksBtn = document.getElementById('add-marks-btn');
const adminMarksMessageArea = document.getElementById('admin-marks-message-area');

const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const closeModalBtn = document.getElementById('close-modal-btn');
const loginMessageArea = document.getElementById('login-message-area');

const welcomeMessage = document.getElementById('welcome-message');

function triggerWelcomeMessage() {
    if (welcomeMessage && !welcomeMessageShown) {
        welcomeMessageShown = true;
        welcomeMessage.style.opacity = '1';
        
        setTimeout(() => {
            welcomeMessage.style.opacity = '0';
             setTimeout(() => {
                 if (welcomeMessage) welcomeMessage.remove()
            }, 500);
        }, 3000);
    }
}

function showPage(pageId) {
    loginModal.classList.add('hidden');

    if (pageId === 'student') {
        triggerWelcomeMessage();
        
        studentPage.classList.remove('hidden');
        adminPage.classList.add('hidden');
        pageHeading.textContent = 'Find Your Result';
        
        navStudent.classList.add('nav-link-active');
        navStudent.classList.remove('nav-link-inactive', 'hover:bg-teal-700', 'hover:text-white');
        
        navAdmin.classList.add('nav-link-inactive', 'hover:bg-teal-700', 'hover:text-white');
        navAdmin.classList.remove('nav-link-active');
        navAdmin.textContent = 'Admin Portal';
        
        isAdminLoggedIn = false;

    } else if (pageId === 'admin' && isAdminLoggedIn) {
        studentPage.classList.add('hidden');
        adminPage.classList.remove('hidden');
        pageHeading.textContent = 'Admin Management';

        navStudent.classList.add('nav-link-inactive', 'hover:bg-teal-700', 'hover:text-white');
        navStudent.classList.remove('nav-link-active');
        
        navAdmin.classList.add('nav-link-active');
        navAdmin.classList.remove('nav-link-inactive', 'hover:bg-teal-700', 'hover:text-white');
        navAdmin.textContent = 'Logout';
    } else {
         console.warn("Attempted to access admin page without login.");
         showPage('student'); 
    }
}

navStudent.addEventListener('click', () => showPage('student'));

navAdmin.addEventListener('click', () => {
    if (isAdminLoggedIn) {
        showPage('student');
    } else {
        loginModal.classList.remove('hidden');
        loginMessageArea.innerHTML = '';
        loginForm.reset();
    }
});

closeModalBtn.addEventListener('click', () => {
    loginModal.classList.add('hidden');
});

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const data = Object.fromEntries(formData.entries());

    const correctUsername = "admin";
    const correctPassword = "admin123";

    if (data.username === correctUsername && data.password === correctPassword) {
        isAdminLoggedIn = true;
        loginModal.classList.add('hidden');
        showPage('admin');
    } else {
        loginMessageArea.innerHTML = "Invalid username or password.";
        isAdminLoggedIn = false;
    }
});


function getGrade(percentage) {
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 40) return "E";
    return "F";
}

function calculateRank(allClassStudents, semester, term) {
    const rankedList = allClassStudents.map(student => {
        let totalObtained = 0;
        const marksData = student.semesters?.[semester]?.[term] || [];
        
        if (marksData.length > 0) {
            for (const subject of marksData) {
                totalObtained += Number(subject.marks) || 0;
            }
        }
        return { roll_no: student.roll_no, totalObtained };
    });

    rankedList.sort((a, b) => {
        if (b.totalObtained !== a.totalObtained) {
            return b.totalObtained - a.totalObtained;
        }
        return (a.roll_no || "").localeCompare(b.roll_no || "");
    });
    
    return rankedList;
}

function calculateCombinedRank(allClassStudents, semester) {
    const rankedList = allClassStudents.map(student => {
        let combinedObtained = 0;
        const midTermMarks = student.semesters?.[semester]?.midTerm || [];
        const finalTermMarks = student.semesters?.[semester]?.finalTerm || [];

        if (midTermMarks.length > 0) {
            for (const subject of midTermMarks) { combinedObtained += Number(subject.marks) || 0; }
        }
        if (finalTermMarks.length > 0) {
            for (const subject of finalTermMarks) { combinedObtained += Number(subject.marks) || 0; }
        }
        
        return { roll_no: student.roll_no, totalObtained: combinedObtained };
    });

    rankedList.sort((a, b) => {
        if (b.totalObtained !== a.totalObtained) {
            return b.totalObtained - a.totalObtained;
        }
        return (a.roll_no || "").localeCompare(b.roll_no || "");
    });
    
    return rankedList;
}

function getPositionString(rankedList, roll_no) {
    const studentRankIndex = rankedList.findIndex(s => s.roll_no === roll_no);
    if (studentRankIndex === -1) return "N/A";

    const studentScore = rankedList[studentRankIndex].totalObtained;
    
    let finalRank = studentRankIndex + 1;
    let currentIdx = studentRankIndex;
    while (currentIdx > 0 && rankedList[currentIdx].totalObtained === rankedList[currentIdx - 1].totalObtained) {
        currentIdx--;
    }
    finalRank = currentIdx + 1;

    if (finalRank === 1) return "1st Position";
    if (finalRank === 2) return "2nd Position";
    if (finalRank === 3) return "3rd Position";
    
    return "N/A";
}


addStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdminLoggedIn) return;

    addStudentBtn.disabled = true;
    addStudentBtn.textContent = "Saving...";
    
    try {
        const formData = new FormData(addStudentForm);
        const data = Object.fromEntries(formData.entries());
        data.semesters = {};

        const students = db.getStudents();

        const existingStudent = students.find(s => 
            s.roll_no === data.roll_no &&
            s.class_name === data.class_name &&
            s.section === data.section &&
            s.session === data.session
        );

        if (existingStudent) {
            showMessage(adminStudentMessageArea, "Error: This student already exists.", "error");
        } else {
            students.push(data);
            db.saveStudents(students);
            showMessage(adminStudentMessageArea, "Student added successfully!", "success");
            addStudentForm.reset();
        }
    } catch (error) {
        console.error("Error saving student:", error);
        showMessage(adminStudentMessageArea, "A critical error occurred.", "error");
    } finally {
        addStudentBtn.disabled = false;
        addStudentBtn.textContent = "Save Student";
    }
});

function addSubjectRow() {
    const container = document.getElementById('dynamic-subjects-container');
    if (!container) return;
    const newRow = document.createElement('div');
    newRow.className = 'flex items-center gap-2';
    newRow.innerHTML = `
        <input type="text" name="subject_name_dyn" required placeholder="Subject Name" class="mt-1 block w-1/2 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
        <input type="number" name="marks_dyn" min="0" required placeholder="Obtained" class="mt-1 block w-1/4 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
        <input type="number" name="total_marks_dyn" min="0" required placeholder="Total" class="mt-1 block w-1/4 rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm">
        <button type="button" class="remove-subject-btn text-red-500 hover:text-red-700 font-medium p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
        </button>
    `;
    
    newRow.querySelector('.remove-subject-btn').addEventListener('click', (e) => {
        e.currentTarget.parentElement.remove();
    });
    
    container.appendChild(newRow);
}

const addSubjectButton = document.getElementById('add-subject-row-btn');
if (addSubjectButton) {
    addSubjectButton.addEventListener('click', addSubjectRow);
}


addMarksForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isAdminLoggedIn) return;

    addMarksBtn.disabled = true;
    addMarksBtn.textContent = "Saving...";

    try {
        const formData = new FormData(addMarksForm);
        const data = Object.fromEntries(formData.entries()); 
        
        const students = db.getStudents();
        
        const studentIndex = students.findIndex(s => 
            s.roll_no === data.roll_no &&
            s.class_name === data.class_name &&
            s.section === data.section &&
            s.session === data.session
        );

        if (studentIndex === -1) {
            showMessage(adminMarksMessageArea, "Error: Student not found.", "error");
        } else {
            const student = students[studentIndex];
            
            if (!student.semesters) student.semesters = {};
            if (!student.semesters[data.semester]) student.semesters[data.semester] = {};
            if (!student.semesters[data.semester][data.term]) student.semesters[data.semester][data.term] = [];
            
            const marksList = student.semesters[data.semester][data.term];
            
            const subjectInputs = addMarksForm.querySelectorAll('input[name="subject_name_dyn"]');
            const marksInputs = addMarksForm.querySelectorAll('input[name="marks_dyn"]');
            const totalMarksInputs = addMarksForm.querySelectorAll('input[name="total_marks_dyn"]');
            
            let subjectsAddedOrUpdated = 0;

            for (let i = 0; i < subjectInputs.length; i++) {
                const subjectName = subjectInputs[i].value.trim();
                const marks = parseInt(marksInputs[i].value, 10);
                const totalMarks = parseInt(totalMarksInputs[i].value, 10);

                if (subjectName && !isNaN(marks) && !isNaN(totalMarks) && marks >= 0 && totalMarks > 0) {
                    const subjectIndex = marksList.findIndex(sub => sub.subject_name.toLowerCase() === subjectName.toLowerCase());
                    
                    const subjectData = { subject_name: subjectName, marks: marks, total_marks: totalMarks };

                    if (subjectIndex > -1) {
                        marksList[subjectIndex] = subjectData;
                    } else {
                        marksList.push(subjectData);
                    }
                    subjectsAddedOrUpdated++;
                } else if (subjectName || marksInputs[i].value || totalMarksInputs[i].value) {
                    console.warn(`Invalid data in subject row ${i+1}: Subject='${subjectName}', Marks='${marksInputs[i].value}', Total='${totalMarksInputs[i].value}'`);
                    showMessage(adminMarksMessageArea, `Invalid data in subject row ${i+1}. Please enter valid subject name, obtained marks (>=0), and total marks (>0).`, "error");
                }
            }
            
            if (subjectsAddedOrUpdated > 0) {
                students[studentIndex] = student;
                db.saveStudents(students);
                showMessage(adminMarksMessageArea, `${subjectsAddedOrUpdated} subject(s) saved for ${student.name}!`, "success");
                
                const container = document.getElementById('dynamic-subjects-container');
                if (container) container.innerHTML = '';
                addSubjectRow();
            } else {
                showMessage(adminMarksMessageArea, "No valid subject marks were entered to save.", "info");
            }
        }
    } catch (error) {
        console.error("Error saving marks:", error);
        showMessage(adminMarksMessageArea, "A critical error occurred.", "error");
    } finally {
        addMarksBtn.disabled = false;
        addMarksBtn.textContent = "Find Student & Save All Marks";
    }
});

resultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    searchButton.disabled = true;
    searchButton.textContent = "Searching...";
    resultDisplay.classList.add('hidden');
    midTermResultContainer.classList.add('hidden');
    finalTermResultContainer.classList.add('hidden');
    overallResultContainer.classList.add('hidden');
    finalSummaryContainer.classList.add('hidden'); 
    
    const formData = new FormData(resultForm);
    const data = Object.fromEntries(formData.entries());
    
    const students = db.getStudents();
    
    const student = students.find(s => 
        s.roll_no === data.roll_no &&
        s.class_name === data.class_name &&
        s.section === data.section &&
        s.session === data.session
    );

    if (!student) {
        showMessage(studentMessageArea, "No student found. Please check details.", "error");
        searchButton.disabled = false;
        searchButton.textContent = "Search Result";
        return;
    }

    const semesterData = student.semesters?.[data.semester];
    if (!semesterData) {
        showMessage(studentMessageArea, "No marks found for this semester.", "error");
        searchButton.disabled = false;
        searchButton.textContent = "Search Result";
        return;
    }

    const midTermMarks = semesterData.midTerm || [];
    const finalTermMarks = semesterData.finalTerm || [];
    
    const allClassStudents = db.getStudents().filter(s => 
        s.session === data.session &&
        s.class_name === data.class_name &&
        s.section === data.section
    );
    
    displayResult(student, data, midTermMarks, finalTermMarks, allClassStudents);
    
    searchButton.disabled = false;
    searchButton.textContent = "Search Result";
});

function populateTable(termType, marksData) {
    const tableBody = document.getElementById(`${termType}-subjects-body`);
    tableBody.innerHTML = "";

    let totalObtained = 0;
    let totalMaxMarks = 0;
    let isFail = false;
    const passMarkPercent = 40; 

    marksData.forEach(subject => {
        const row = document.createElement("tr");
        const passMark = subject.total_marks > 0 ? (subject.total_marks * passMarkPercent) / 100 : 0; 
        const status = subject.marks >= passMark ? "Pass" : "Fail";
        const statusClass = status === "Pass" ? "text-green-600 font-medium" : "text-red-600 font-medium";
        
        const subjectPercentage = subject.total_marks > 0 ? (subject.marks / subject.total_marks) * 100 : 0;
        const grade = getGrade(subjectPercentage);

        if (status === "Fail") isFail = true;
        
        totalObtained += Number(subject.marks) || 0; 
        totalMaxMarks += Number(subject.total_marks) || 0;

        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${subject.subject_name || 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${subject.marks ?? 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${subject.total_marks ?? 'N/A'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm ${statusClass}">${status}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">${grade}</td>
        `;
        tableBody.appendChild(row);
    });

    const finalStatus = isFail ? "Fail" : "Pass";
    const finalStatusClass = isFail ? "text-red-600" : "text-green-600";
    const percentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;

    document.getElementById(`${termType}-total-obtained`).textContent = totalObtained;
    document.getElementById(`${termType}-total-marks`).textContent = totalMaxMarks;
    document.getElementById(`${termType}-final-status`).textContent = finalStatus;
    document.getElementById(`${termType}-final-status`).className = `px-6 py-4 text-sm font-bold ${finalStatusClass}`;
    
    return { totalObtained, totalMaxMarks, percentage, finalStatus, finalStatusClass, hasData: marksData.length > 0 };
}


function displayResult(student, searchData, midTermMarks, finalTermMarks, allClassStudents) {
    document.getElementById("student-name").textContent = student.name;
    document.getElementById("father-name").textContent = student.father_name;
    document.getElementById("class-info").textContent = `${student.class_name} - ${student.section}`;
    document.getElementById("roll-info").textContent = student.roll_no;
    document.getElementById("session-info").textContent = student.session;
    document.getElementById("semester-info").textContent = searchData.semester;
    document.getElementById("term-info").textContent = searchData.term === 'midTerm' ? 'Mid Term' : 'Final Term';

    let midTermStats = null;
    let finalTermStats = null;
    let hasAnyMarks = false;

    const midTermPositionRow = document.getElementById('mid-term-position-row');
    const midTermPositionStatus = document.getElementById('mid-term-position-status');
    const finalTermPositionRow = document.getElementById('final-term-position-row');
    const finalTermPositionStatus = document.getElementById('final-term-position-status');
    const summaryCombinedPosition = document.getElementById('summary-combined-position');

    midTermPositionRow.classList.add('hidden');
    finalTermPositionRow.classList.add('hidden');
    summaryCombinedPosition.textContent = 'N/A';

    midTermResultContainer.classList.add('hidden');
    finalTermResultContainer.classList.add('hidden');
    finalSummaryContainer.classList.add('hidden');
    overallResultContainer.classList.add('hidden');


    if (midTermMarks.length > 0) {
        midTermStats = populateTable('mid-term', midTermMarks);
        const midTermRankInfo = calculateRank(allClassStudents, searchData.semester, 'midTerm');
        const midTermPosition = getPositionString(midTermRankInfo, student.roll_no);
        if (midTermPosition !== "N/A") {
            midTermPositionStatus.textContent = midTermPosition;
            midTermPositionRow.classList.remove('hidden');
        }
    }
    if (finalTermMarks.length > 0) {
        finalTermStats = populateTable('final-term', finalTermMarks);
        const finalTermRankInfo = calculateRank(allClassStudents, searchData.semester, 'finalTerm');
        const finalTermPosition = getPositionString(finalTermRankInfo, student.roll_no);
        if (finalTermPosition !== "N/A") {
            finalTermPositionStatus.textContent = finalTermPosition;
            finalTermPositionRow.classList.remove('hidden');
        }
    }

    if (searchData.term === 'midTerm') {
        if (midTermStats && midTermStats.hasData) {
            midTermResultContainer.classList.remove('hidden');
            document.getElementById("final-percentage").textContent = `${midTermStats.percentage.toFixed(2)}%`;
            document.getElementById("overall-term-label").textContent = "Mid Term";
            overallResultContainer.classList.remove('hidden');
            hasAnyMarks = true;
        }
    } 
    else if (searchData.term === 'finalTerm') {
        let overallPercentageToShow = 0;
        let overallLabelToShow = "Final Term";

        if (midTermStats && midTermStats.hasData) {
            midTermResultContainer.classList.remove('hidden');
            hasAnyMarks = true;
        }
        
        if (finalTermStats && finalTermStats.hasData) {
            finalTermResultContainer.classList.remove('hidden');
            overallPercentageToShow = finalTermStats.percentage;
            hasAnyMarks = true;
        }

        if (midTermStats && midTermStats.hasData && finalTermStats && finalTermStats.hasData) {
            const combinedObtained = midTermStats.totalObtained + finalTermStats.totalObtained;
            const combinedTotal = midTermStats.totalMaxMarks + finalTermStats.totalMaxMarks;
            const combinedPercentage = combinedTotal > 0 ? (combinedObtained / combinedTotal) * 100 : 0;
            const combinedGrade = getGrade(combinedPercentage);

            document.getElementById('summary-mid-marks').textContent = `${midTermStats.totalObtained} / ${midTermStats.totalMaxMarks}`;
            document.getElementById('summary-final-marks').textContent = `${finalTermStats.totalObtained} / ${finalTermStats.totalMaxMarks}`;
            document.getElementById('summary-combined-marks').textContent = `${combinedObtained} / ${combinedTotal}`;
            document.getElementById('summary-overall-percentage').textContent = `${combinedPercentage.toFixed(2)}%`;
            document.getElementById('summary-overall-grade').textContent = combinedGrade;
            
            const combinedRankInfo = calculateCombinedRank(allClassStudents, searchData.semester);
            const combinedPosition = getPositionString(combinedRankInfo, student.roll_no);
            summaryCombinedPosition.textContent = combinedPosition;
            
            finalSummaryContainer.classList.remove('hidden');

            overallPercentageToShow = combinedPercentage;
            overallLabelToShow = "Mid & Final Term Combined";
        }

        if (hasAnyMarks) {
            document.getElementById("final-percentage").textContent = `${overallPercentageToShow.toFixed(2)}%`;
            document.getElementById("overall-term-label").textContent = overallLabelToShow;
            overallResultContainer.classList.remove('hidden');
        }
    }

    if (hasAnyMarks) {
        resultDisplay.classList.remove('hidden');
        showMessage(studentMessageArea, "Result found successfully!", "success");
    } else {
         if ((searchData.term === 'midTerm' && (!midTermStats || !midTermStats.hasData)) || 
             (searchData.term === 'finalTerm' && (!finalTermStats || !finalTermStats.hasData))) {
             showMessage(studentMessageArea, "Marks have not been added for this specific term yet.", "error");
         } else if (!hasAnyMarks) {
             showMessage(studentMessageArea, "No marks found for this semester.", "error");
         }
        resultDisplay.classList.add('hidden');
    }
}

function showMessage(areaElement, message, type) {
    if (!areaElement) return; 
    
    areaElement.innerHTML = ""; 

    if (type === "clear") {
        return;
    }
    
    let color = "text-red-600"; 
    if (type === "success") {
        color = "text-green-600";
    } else if (type === "info") {
        color = "text-blue-600";
    }

    areaElement.innerHTML = `<p class="${color} font-medium">${message}</p>`;
    
    setTimeout(() => {
        if (areaElement.innerHTML.includes(message)) {
             areaElement.innerHTML = "";
        }
    }, 5000);
}

document.addEventListener('DOMContentLoaded', () => {
    showPage('student');
    addSubjectRow();
    
});