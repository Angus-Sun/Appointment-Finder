let data = [];
let selectedIndex = -1; 

async function loadData() {
    const response = await fetch('data.json');
    data = await response.json();
}
//filtering thing
function searchNames() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const suggestions = document.getElementById('suggestions');
    suggestions.innerHTML = '';  
    suggestions.style.display = 'none'; 

    if (query.length > 0) {
        const uniqueStudents = new Set();
        const filtered = data.filter(item => item.Student.toLowerCase().startsWith(query));

        if (filtered.length > 0) {
            suggestions.style.display = 'block'; 
            
            filtered.forEach((item, index) => {
                if (!uniqueStudents.has(item.Student)) {
                    uniqueStudents.add(item.Student);
                    const li = document.createElement('li');
                    li.textContent = item.Student;
                    li.onclick = () => {
                        document.getElementById('searchBar').value = item.Student;
                        displayAppointments(item.Student); 
                        suggestions.style.display = 'none'; 
                    };
                    li.onmouseenter = () => highlightSuggestion(index);
                    suggestions.appendChild(li);
                }
            });
        }
    }
}

function highlightSuggestion(index) {
    const suggestions = document.querySelectorAll('#suggestions li');
    suggestions.forEach((li, i) => {
        li.classList.remove('selected');
        if (i === index) li.classList.add('selected');
    });
}
//cool arrow key thing to scroll and select
document.getElementById('searchBar').addEventListener('keydown', function(event) {
    const suggestions = document.querySelectorAll('#suggestions li');
    const suggestionsContainer = document.getElementById('suggestions');
    if (suggestions.length === 0) return;
    if (event.key === 'ArrowDown') {
        selectedIndex = (selectedIndex + 1) % suggestions.length; 
        highlightSuggestion(selectedIndex);
        const selectedItem = suggestions[selectedIndex];
        const containerHeight = suggestionsContainer.clientHeight;
        const itemBottom = selectedItem.offsetTop + selectedItem.offsetHeight;
        if (itemBottom > suggestionsContainer.scrollTop + containerHeight) {
            suggestionsContainer.scrollTop = itemBottom - containerHeight;
        }
        if (selectedIndex === 0) {
            suggestionsContainer.scrollTop = 0;
        }
    }

    else if (event.key === 'ArrowUp') {
        selectedIndex = (selectedIndex - 1 + suggestions.length) % suggestions.length; 
        highlightSuggestion(selectedIndex);
        const selectedItem = suggestions[selectedIndex];
        const itemTop = selectedItem.offsetTop;
        if (itemTop < suggestionsContainer.scrollTop) {
            suggestionsContainer.scrollTop = itemTop; 
        }
        if (selectedIndex === suggestions.length - 1) {
            suggestionsContainer.scrollTop = suggestionsContainer.scrollHeight; 
        }
    }

    else if (event.key === 'Enter') {
        if (selectedIndex !== -1) {
            const selectedStudent = suggestions[selectedIndex].textContent;
            document.getElementById('searchBar').value = selectedStudent;
            displayAppointments(selectedStudent);
            document.getElementById('suggestions').style.display = 'none';
        }
    }
});


function displayAppointments(studentName) {
    //filters appointments by student name and sorts appointments by time
    const studentAppointments = data.filter(item => item.Student === studentName);
    studentAppointments.sort((a, b) => {
        const dateA = parseDateTime(a['Date and Time']);
        const dateB = parseDateTime(b['Date and Time']);
        return dateA - dateB;
    });

    let tableHTML = `
        <table border="1" cellpadding="5" cellspacing="0">
            <thead>
                <tr>
                    <th>Teacher</th>
                    <th>Time</th>
                    <th>Room Number</th>
                </tr>
            </thead>
            <tbody>
    `;

    studentAppointments.forEach(appointment => {
        const teacherName = extractTeacherName(appointment.Teacher);
        const roomNumber = extractLocation(appointment.Teacher);
        const time = formatDate(appointment['Date and Time']);
        tableHTML += `
            <tr>
                <td>${teacherName}</td>
                <td>${time}</td>
                <td>${roomNumber}</td>
            </tr>
        `;
    });

    tableHTML += `
            </tbody>
        </table>
    `;

    document.getElementById('details').innerHTML = tableHTML;
}

function parseDateTime(dateTime) {
    const [monthAbbrev, day, time, period] = dateTime.split(/[@\s]+/);
    //could be removed but just in case the school hosts conferences on multiple different dates in the future
    const monthMap = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
    };

    const [hours, minutes] = time.split(':').map(Number);
    const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours % 12;

    return new Date(2025, monthMap[monthAbbrev], Number(day), adjustedHours, minutes);
}

function formatDate(dateTime) {
    const [monthAbbrev, day, time, period] = dateTime.split(/[@\s]+/);
    return time + " " + period;
}

function extractTeacherName(teacher) {
    return teacher.split(' - ')[0];
}

function extractLocation(teacher) {
    const match = teacher.match(/\[([A-Za-z0-9]+)\]/);
    return match;
}

window.onload = loadData;
