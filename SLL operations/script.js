// Global variables
let list = [];
let highlightIndex = -1;
const maxSize = 10;

// Update the display
function updateDisplay() {
    const visualization = document.getElementById('visualization');
    const currentSizeSpan = document.getElementById('currentSize');
    
    currentSizeSpan.textContent = `${list.length}/${maxSize}`;
    
    if (list.length === 0) {
        visualization.innerHTML = '<p class="empty-message">Empty List - Add some nodes to get started</p>';
        return;
    }
    
    let html = '<div class="list-container">';
    html += '<div class="list-label">HEAD</div>';
    
    list.forEach((value, index) => {
        const isHighlight = highlightIndex === index;
        html += `
            <div class="node ${isHighlight ? 'highlight' : ''}">
                <div class="node-box">
                    <div class="node-content">
                        <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                        </svg>
                        <span class="node-value">${value}</span>
                        <svg class="arrow-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                    <div class="node-position">pos: ${index}</div>
                </div>
            </div>
        `;
        
        if (index < list.length - 1) {
            html += `
                <div class="connector">
                    <svg class="arrow-right" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                    <svg class="arrow-left" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </div>
            `;
        }
    });
    
    html += '<div class="list-label">TAIL</div>';
    html += '</div>';
    
    visualization.innerHTML = html;
}

// Show message
function showMessage(msg, duration = 3000) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = msg;
    messageDiv.classList.add('show');
    
    setTimeout(() => {
        messageDiv.classList.remove('show');
    }, duration);
}

// Insert at beginning
function insertAtBeginning() {
    const inputValue = document.getElementById('insertValue').value.trim();
    
    if (!inputValue) {
        showMessage('Please enter a value');
        return;
    }
    
    if (list.length >= maxSize) {
        showMessage('List is full!');
        return;
    }
    
    list.unshift(inputValue);
    showMessage(`Inserted "${inputValue}" at beginning`);
    document.getElementById('insertValue').value = '';
    
    highlightIndex = 0;
    updateDisplay();
    setTimeout(() => {
        highlightIndex = -1;
        updateDisplay();
    }, 1500);
}

// Insert at end
function insertAtEnd() {
    const inputValue = document.getElementById('insertValue').value.trim();
    
    if (!inputValue) {
        showMessage('Please enter a value');
        return;
    }
    
    if (list.length >= maxSize) {
        showMessage('List is full!');
        return;
    }
    
    list.push(inputValue);
    showMessage(`Inserted "${inputValue}" at end`);
    document.getElementById('insertValue').value = '';
    
    highlightIndex = list.length - 1;
    updateDisplay();
    setTimeout(() => {
        highlightIndex = -1;
        updateDisplay();
    }, 1500);
}

// Insert at position
function insertAtPosition() {
    const inputValue = document.getElementById('insertValue').value.trim();
    const position = parseInt(document.getElementById('insertPosition').value);
    
    if (!inputValue) {
        showMessage('Please enter a value');
        return;
    }
    
    if (isNaN(position) || position < 0 || position > list.length) {
        showMessage(`Invalid position. Enter between 0 and ${list.length}`);
        return;
    }
    
    if (list.length >= maxSize) {
        showMessage('List is full!');
        return;
    }
    
    list.splice(position, 0, inputValue);
    showMessage(`Inserted "${inputValue}" at position ${position}`);
    document.getElementById('insertValue').value = '';
    document.getElementById('insertPosition').value = '';
    
    highlightIndex = position;
    updateDisplay();
    setTimeout(() => {
        highlightIndex = -1;
        updateDisplay();
    }, 1500);
}

// Delete from beginning
function deleteFromBeginning() {
    if (list.length === 0) {
        showMessage('List is empty!');
        return;
    }
    
    const deleted = list.shift();
    showMessage(`Deleted "${deleted}" from beginning`);
    updateDisplay();
}

// Delete from end
function deleteFromEnd() {
    if (list.length === 0) {
        showMessage('List is empty!');
        return;
    }
    
    const deleted = list.pop();
    showMessage(`Deleted "${deleted}" from end`);
    updateDisplay();
}

// Delete at position
function deleteAtPosition() {
    const position = parseInt(document.getElementById('deletePosition').value);
    
    if (list.length === 0) {
        showMessage('List is empty!');
        return;
    }
    
    if (isNaN(position) || position < 0 || position >= list.length) {
        showMessage(`Invalid position. Enter between 0 and ${list.length - 1}`);
        return;
    }
    
    const deleted = list.splice(position, 1)[0];
    showMessage(`Deleted "${deleted}" from position ${position}`);
    document.getElementById('deletePosition').value = '';
    updateDisplay();
}

// Search
function search() {
    const searchValue = document.getElementById('searchValue').value.trim();
    
    if (!searchValue) {
        showMessage('Please enter a search value');
        return;
    }
    
    const index = list.indexOf(searchValue);
    
    if (index !== -1) {
        highlightIndex = index;
        showMessage(`Found "${searchValue}" at position ${index}`);
        updateDisplay();
        setTimeout(() => {
            highlightIndex = -1;
            updateDisplay();
        }, 3000);
    } else {
        showMessage(`"${searchValue}" not found in list`);
    }
    
    document.getElementById('searchValue').value = '';
}

// Traverse
function traverse() {
    if (list.length === 0) {
        showMessage('List is empty!');
        return;
    }
    
    showMessage(`Traversing: ${list.join(' → ')}`, 4000);
    
    let i = 0;
    const interval = setInterval(() => {
        if (i < list.length) {
            highlightIndex = i;
            updateDisplay();
            i++;
        } else {
            clearInterval(interval);
            highlightIndex = -1;
            updateDisplay();
        }
    }, 500);
}

// Check if empty
function checkIsEmpty() {
    const empty = list.length === 0;
    showMessage(empty ? 'List is EMPTY' : 'List is NOT empty');
}

// Check if full
function checkIsFull() {
    const full = list.length >= maxSize;
    showMessage(full ? `List is FULL (Max: ${maxSize})` : `List is NOT full (${list.length}/${maxSize})`);
}

// Initialize
updateDisplay();