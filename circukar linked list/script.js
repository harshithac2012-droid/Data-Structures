// Global variables
let nodes = [];
const maxSize = 10;
let highlightedIndex = -1;
let traverseAnimationId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupSVG();
    updateVisualization();
    
    // Add enter key listeners
    document.getElementById('insertValue').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') insertNode();
    });
    
    document.getElementById('deleteValue').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') deleteNode();
    });
    
    document.getElementById('searchValue').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchNode();
    });
});

// Setup SVG with arrowhead marker
function setupSVG() {
    const svg = document.getElementById('circularList');
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#94a3b8');
    
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.insertBefore(defs, svg.firstChild);
}

// Utility Functions
function showMessage(text, isError = false) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${isError ? 'error' : 'success'}`;
    
    setTimeout(() => {
        messageEl.className = 'message hidden';
    }, 3000);
}

function isEmpty() {
    return nodes.length === 0;
}

function isFull() {
    return nodes.length >= maxSize;
}

// Calculate node positions in a circle
function calculateNodePositions(numNodes) {
    const positions = [];
    const centerX = 300;
    const centerY = 250;
    const radius = 150;
    const startAngle = -Math.PI / 2; // Start from top
    
    for (let i = 0; i < numNodes; i++) {
        const angle = startAngle + (2 * Math.PI * i) / numNodes;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        positions.push({ x, y, angle });
    }
    
    return positions;
}

// Create curved arrow path between two points
function createArrowPath(start, end, isCircular = false) {
    if (isCircular) {
        // For the last node connecting back to first, create a curved arc
        const radius = 180;
        return `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;
    } else {
        // For regular connections, use a smooth curve
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const curve = distance * 0.2;
        
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        
        const perpX = -dy / distance * curve;
        const perpY = dx / distance * curve;
        
        return `M ${start.x} ${start.y} Q ${midX + perpX} ${midY + perpY} ${end.x} ${end.y}`;
    }
}

// Update visualization
function updateVisualization() {
    const nodeCount = document.getElementById('nodeCount');
    const emptyMessage = document.getElementById('emptyMessage');
    const nodesGroup = document.getElementById('nodesGroup');
    const arrowsGroup = document.getElementById('arrowsGroup');
    
    nodeCount.textContent = nodes.length;
    
    // Clear existing elements
    nodesGroup.innerHTML = '';
    arrowsGroup.innerHTML = '';
    
    if (isEmpty()) {
        emptyMessage.classList.remove('hidden');
        return;
    }
    
    emptyMessage.classList.add('hidden');
    
    const positions = calculateNodePositions(nodes.length);
    const nodeRadius = 35;
    
    // Draw arrows first (so they appear behind nodes)
    positions.forEach((pos, idx) => {
        const nextIdx = (idx + 1) % nodes.length;
        const nextPos = positions[nextIdx];
        
        // Calculate edge points of circles
        const angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x);
        const startX = pos.x + nodeRadius * Math.cos(angle);
        const startY = pos.y + nodeRadius * Math.sin(angle);
        const endX = nextPos.x - nodeRadius * Math.cos(angle);
        const endY = nextPos.y - nodeRadius * Math.sin(angle);
        
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const isCircular = idx === nodes.length - 1;
        path.setAttribute('d', createArrowPath(
            { x: startX, y: startY },
            { x: endX, y: endY },
            isCircular
        ));
        path.setAttribute('class', 'arrow-path');
        path.setAttribute('id', `arrow-${idx}`);
        
        arrowsGroup.appendChild(path);
    });
    
    // Draw nodes
    positions.forEach((pos, idx) => {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Node circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', pos.x);
        circle.setAttribute('cy', pos.y);
        circle.setAttribute('r', nodeRadius);
        circle.setAttribute('class', `node-circle ${highlightedIndex === idx ? 'highlight' : ''}`);
        circle.setAttribute('id', `node-${idx}`);
        
        // Node text (value)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', pos.x);
        text.setAttribute('y', pos.y);
        text.setAttribute('class', 'node-text');
        text.textContent = nodes[idx].value;
        
        // Position label
        const posLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        posLabel.setAttribute('x', pos.x);
        posLabel.setAttribute('y', pos.y + nodeRadius + 20);
        posLabel.setAttribute('class', 'node-position');
        posLabel.textContent = `pos: ${idx}`;
        
        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(posLabel);
        nodesGroup.appendChild(group);
    });
}

// Insert Node
function insertNode() {
    const inputEl = document.getElementById('insertValue');
    const positionEl = document.getElementById('insertPosition');
    const inputValue = inputEl.value.trim();
    const position = positionEl.value;
    
    if (!inputValue) {
        showMessage('Please enter a value', true);
        return;
    }
    
    if (isFull()) {
        showMessage('List is full! Maximum size reached.', true);
        return;
    }
    
    const newNode = {
        id: Date.now(),
        value: inputValue
    };
    
    switch (position) {
        case 'beginning':
            nodes.unshift(newNode);
            showMessage(`Inserted ${inputValue} at beginning`);
            break;
        case 'end':
            nodes.push(newNode);
            showMessage(`Inserted ${inputValue} at end`);
            break;
        case 'position':
            const parts = inputValue.split(',');
            if (parts.length !== 2) {
                showMessage('Invalid format! Use: value,position', true);
                return;
            }
            const val = parts[0].trim();
            const pos = parseInt(parts[1].trim());
            
            if (isNaN(pos) || pos < 0 || pos > nodes.length) {
                showMessage('Invalid position! Must be between 0 and ' + nodes.length, true);
                return;
            }
            
            nodes.splice(pos, 0, { id: Date.now(), value: val });
            showMessage(`Inserted ${val} at position ${pos}`);
            break;
    }
    
    inputEl.value = '';
    updateVisualization();
}

// Delete Node
function deleteNode() {
    const positionEl = document.getElementById('deletePosition');
    const valueEl = document.getElementById('deleteValue');
    const position = positionEl.value;
    
    if (isEmpty()) {
        showMessage('List is empty! Nothing to delete.', true);
        return;
    }
    
    let deletedValue = '';
    
    switch (position) {
        case 'beginning':
            deletedValue = nodes.shift().value;
            showMessage(`Deleted ${deletedValue} from beginning`);
            break;
        case 'end':
            deletedValue = nodes.pop().value;
            showMessage(`Deleted ${deletedValue} from end`);
            break;
        case 'value':
            const valueToDelete = valueEl.value.trim();
            if (!valueToDelete) {
                showMessage('Please enter a value to delete', true);
                return;
            }
            
            const idx = nodes.findIndex(n => n.value === valueToDelete);
            if (idx === -1) {
                showMessage(`Value ${valueToDelete} not found!`, true);
                return;
            }
            
            deletedValue = nodes.splice(idx, 1)[0].value;
            showMessage(`Deleted ${deletedValue}`);
            valueEl.value = '';
            break;
    }
    
    updateVisualization();
}

// Search Node
function searchNode() {
    const searchEl = document.getElementById('searchValue');
    const searchValue = searchEl.value.trim();
    
    if (!searchValue) {
        showMessage('Please enter a value to search', true);
        return;
    }
    
    if (isEmpty()) {
        showMessage('List is empty!', true);
        return;
    }
    
    const idx = nodes.findIndex(n => n.value === searchValue);
    
    if (idx !== -1) {
        highlightedIndex = idx;
        updateVisualization();
        showMessage(`Found ${searchValue} at position ${idx}`);
        
        setTimeout(() => {
            highlightedIndex = -1;
            updateVisualization();
        }, 3000);
    } else {
        showMessage(`${searchValue} not found in list`, true);
    }
    
    searchEl.value = '';
}

// Traverse List with animation
function traverseList() {
    if (isEmpty()) {
        showMessage('List is empty!', true);
        return;
    }
    
    const values = nodes.map(n => n.value).join(' → ');
    showMessage(`Traversal: ${values} → (back to start)`);
    
    // Animate traversal
    let currentIdx = 0;
    
    if (traverseAnimationId) {
        clearInterval(traverseAnimationId);
    }
    
    traverseAnimationId = setInterval(() => {
        highlightedIndex = currentIdx;
        updateVisualization();
        
        currentIdx++;
        if (currentIdx >= nodes.length) {
            clearInterval(traverseAnimationId);
            setTimeout(() => {
                highlightedIndex = -1;
                updateVisualization();
            }, 500);
        }
    }, 600);
}

// Check if Empty
function checkEmpty() {
    showMessage(isEmpty() ? 'List is EMPTY' : 'List is NOT empty');
}

// Check if Full
function checkFull() {
    showMessage(isFull() ? `List is FULL (${maxSize} nodes)` : `List is NOT full (${nodes.length}/${maxSize})`);
}

// Toggle delete input visibility
function toggleDeleteInput() {
    const positionEl = document.getElementById('deletePosition');
    const valueEl = document.getElementById('deleteValue');
    
    if (positionEl.value === 'value') {
        valueEl.classList.remove('hidden');
    } else {
        valueEl.classList.add('hidden');
    }
}