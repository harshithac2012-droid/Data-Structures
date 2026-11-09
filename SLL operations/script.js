// Linked List Array
let list = [];
let highlightedIndex = null;

// Helper function to show messages
function showMessage(msg, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = msg;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        messageEl.className = 'message hidden';
    }, 3000);
}

// Render the linked list visualization
function renderList() {
    const container = document.getElementById('listContainer');
    const lengthEl = document.getElementById('length');
    
    lengthEl.textContent = list.length;
    
    if (list.length === 0) {
        container.innerHTML = '<p class="empty-message">List is empty. Add some nodes to get started!</p>';
        return;
    }
    
    let html = '<div class="list-head">HEAD →</div>';
    
    list.forEach((value, index) => {
        const isHighlighted = highlightedIndex === index;
        html += `
            <div class="node-wrapper ${isHighlighted ? 'highlight' : ''}">
                <div class="node ${isHighlighted ? 'highlight' : ''}">
                    <div class="node-position">pos: ${index}</div>
                    <div class="node-value">${value}</div>
                </div>
            </div>
        `;
        
        if (index < list.length - 1) {
            html += '<div class="arrow">→</div>';
        }
    });
    
    html += '<div class="list-null">→ NULL</div>';
    
    container.innerHTML = html;
}

// Insertion Operations
function insertAtBeginning() {
    const input = document.getElementById('insertValue');
    const value = input.value.trim();
    
    if (!value) {
        showMessage('Please enter a value', 'error');
        return;
    }
    
    list.unshift(value);
    input.value = '';
    renderList();
    showMessage(`Inserted "${value}" at beginning`, 'success');
}

function insertAtEnd() {
    const input = document.getElementById('insertValue');
    const value = input.value.trim();
    
    if (!value) {
        showMessage('Please enter a value', 'error');
        return;
    }
    
    list.push(value);
    input.value = '';
    renderList();
    showMessage(`Inserted "${value}" at end`, 'success');
}

function insertAtPosition() {
    const valueInput = document.getElementById('insertValue');
    const posInput = document.getElementById('insertPosition');
    const value = valueInput.value.trim();
    const pos = parseInt(posInput.value);
    
    if (!value) {
        showMessage('Please enter a value', 'error');
        return;
    }
    
    if (isNaN(pos) || pos < 0 || pos > list.length) {
        showMessage(`Invalid position. Enter between 0 and ${list.length}`, 'error');
        return;
    }
    
    list.splice(pos, 0, value);
    valueInput.value = '';
    posInput.value = '';
    renderList();
    showMessage(`Inserted "${value}" at position ${pos}`, 'success');
}

// Deletion Operations
function deleteAtBeginning() {
    if (list.length === 0) {
        showMessage('List is empty', 'error');
        return;
    }
    
    const deleted = list.shift();
    renderList();
    showMessage(`Deleted "${deleted}" from beginning`, 'success');
}

function deleteAtEnd() {
    if (list.length === 0) {
        showMessage('List is empty', 'error');
        return;
    }
    
    const deleted = list.pop();
    renderList();
    showMessage(`Deleted "${deleted}" from end`, 'success');
}

function deleteAtPosition() {
    const posInput = document.getElementById('deletePosition');
    const pos = parseInt(posInput.value);
    
    if (list.length === 0) {
        showMessage('List is empty', 'error');
        return;
    }
    
    if (isNaN(pos) || pos < 0 || pos >= list.length) {
        showMessage(`Invalid position. Enter between 0 and ${list.length - 1}`, 'error');
        return;
    }
    
    const deleted = list.splice(pos, 1)[0];
    posInput.value = '';
    renderList();
    showMessage(`Deleted "${deleted}" from position ${pos}`, 'success');
}

// Search Operation
function searchNode() {
    const input = document.getElementById('searchValue');
    const value = input.value.trim();
    
    if (!value) {
        showMessage('Please enter a search value', 'error');
        return;
    }
    
    const index = list.indexOf(value);
    
    if (index !== -1) {
        highlightedIndex = index;
        renderList();
        showMessage(`Found "${value}" at position ${index}`, 'success');
        
        setTimeout(() => {
            highlightedIndex = null;
            renderList();
        }, 3000);
    } else {
        showMessage(`"${value}" not found in list`, 'error');
    }
    
    input.value = '';
}

// Traverse Operation
function traverse() {
    if (list.length === 0) {
        showMessage('List is empty', 'error');
        return;
    }
    
    const traversal = list.join(' → ');
    showMessage(`Traversing: ${traversal}`, 'success');
}

// Status Check Operations
function checkIsEmpty() {
    const empty = list.length === 0;
    showMessage(empty ? 'List is EMPTY' : 'List is NOT empty', empty ? 'error' : 'success');
}

function checkIsFull() {
    showMessage('Linked lists are never full (dynamic memory allocation)', 'success');
}

// Initialize the visualization on page load
renderList();