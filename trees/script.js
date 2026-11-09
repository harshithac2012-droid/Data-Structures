// Tree Node Class
class TreeNode {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
    }
}

// Global variables
let root = null;
let highlightedNodes = new Set();
const canvas = document.getElementById('treeCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    drawTree();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Insert node into BST
function insertBST(node, value) {
    if (node === null) {
        return new TreeNode(value);
    }
    
    if (value < node.value) {
        node.left = insertBST(node.left, value);
    } else if (value > node.value) {
        node.right = insertBST(node.right, value);
    } else {
        // Value already exists - don't insert duplicate
        return null; // Signal that insertion failed
    }
    
    return node;
}

// Insert node into Binary Tree (level order)
function insertBinary(value) {
    const newNode = new TreeNode(value);
    
    if (root === null) {
        root = newNode;
        return true;
    }
    
    const queue = [root];
    while (queue.length > 0) {
        const current = queue.shift();
        
        if (current.left === null) {
            current.left = newNode;
            return true;
        }
        queue.push(current.left);
        
        if (current.right === null) {
            current.right = newNode;
            return true;
        }
        queue.push(current.right);
    }
    return true;
}

// Insert node
function insertNode() {
    const input = document.getElementById('insertInput');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        showMessage('Please enter a valid number!', 'error');
        return;
    }
    
    const treeType = document.getElementById('treeType').value;
    
    if (treeType === 'bst') {
        if (root === null) {
            root = new TreeNode(value);
            showMessage(`Inserted ${value} into the tree`, 'success');
        } else {
            const oldRoot = root;
            root = insertBST(root, value);
            
            // Check if insertion was successful
            if (root === null) {
                root = oldRoot; // Restore old root
                showMessage(`Value ${value} already exists in tree!`, 'error');
                input.value = '';
                return;
            }
            showMessage(`Inserted ${value} into the tree`, 'success');
        }
    } else {
        insertBinary(value);
        showMessage(`Inserted ${value} into the tree`, 'success');
    }
    
    input.value = '';
    updateTreeInfo();
    drawTree();
    updateTraversals();
}

// Search for a node
function searchNode() {
    const input = document.getElementById('searchInput');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        showMessage('Please enter a valid number!', 'error');
        return;
    }
    
    if (root === null) {
        showMessage('Tree is empty!', 'error');
        return;
    }
    
    highlightedNodes.clear();
    const found = search(root, value);
    
    if (found) {
        showMessage(`Found ${value} in the tree! (Highlighted in orange)`, 'success');
    } else {
        showMessage(`${value} not found in the tree`, 'error');
    }
    
    drawTree();
    
    // Clear highlights after 3 seconds
    setTimeout(() => {
        highlightedNodes.clear();
        drawTree();
    }, 3000);
}

function search(node, value) {
    if (node === null) return false;
    
    highlightedNodes.add(node);
    
    if (node.value === value) return true;
    
    const treeType = document.getElementById('treeType').value;
    
    if (treeType === 'bst') {
        // Use BST property for efficient search
        if (value < node.value) {
            return search(node.left, value);
        } else {
            return search(node.right, value);
        }
    } else {
        // For regular binary tree, search both sides
        return search(node.left, value) || search(node.right, value);
    }
}

// Delete node from BST
function deleteNodeBST(node, value) {
    if (node === null) {
        return null;
    }
    
    if (value < node.value) {
        node.left = deleteNodeBST(node.left, value);
        return node;
    } else if (value > node.value) {
        node.right = deleteNodeBST(node.right, value);
        return node;
    } else {
        // Node found - delete it
        
        // Case 1: Node has no children (leaf node)
        if (node.left === null && node.right === null) {
            return null;
        }
        
        // Case 2: Node has only right child
        if (node.left === null) {
            return node.right;
        }
        
        // Case 3: Node has only left child
        if (node.right === null) {
            return node.left;
        }
        
        // Case 4: Node has two children
        // Find inorder successor (minimum value in right subtree)
        let minRight = findMin(node.right);
        node.value = minRight.value;
        node.right = deleteNodeBST(node.right, minRight.value);
        return node;
    }
}

function findMin(node) {
    while (node.left !== null) {
        node = node.left;
    }
    return node;
}

// Delete node
function deleteNode() {
    const input = document.getElementById('deleteInput');
    const value = parseInt(input.value);
    
    if (isNaN(value)) {
        showMessage('Please enter a valid number!', 'error');
        return;
    }
    
    if (root === null) {
        showMessage('Tree is empty!', 'error');
        return;
    }
    
    const treeType = document.getElementById('treeType').value;
    
    if (treeType === 'bst') {
        const oldRoot = root;
        root = deleteNodeBST(root, value);
        
        // Check if anything was actually deleted
        if (countNodes(root) === countNodes(oldRoot)) {
            showMessage(`Value ${value} not found in tree`, 'error');
        } else {
            showMessage(`Deleted ${value} from the tree`, 'success');
        }
    } else {
        showMessage('Delete operation only works for Binary Search Tree', 'info');
    }
    
    input.value = '';
    highlightedNodes.clear();
    updateTreeInfo();
    drawTree();
    updateTraversals();
}

// Clear tree
function clearTree() {
    root = null;
    highlightedNodes.clear();
    showMessage('Tree cleared!', 'info');
    updateTreeInfo();
    drawTree();
    updateTraversals();
}

// Calculate tree height
function getHeight(node) {
    if (node === null) return 0;
    return 1 + Math.max(getHeight(node.left), getHeight(node.right));
}

// Count nodes
function countNodes(node) {
    if (node === null) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
}

// Count leaf nodes
function countLeaves(node) {
    if (node === null) return 0;
    if (node.left === null && node.right === null) return 1;
    return countLeaves(node.left) + countLeaves(node.right);
}

// Update tree info
function updateTreeInfo() {
    document.getElementById('nodeCount').textContent = countNodes(root);
    document.getElementById('treeHeight').textContent = getHeight(root);
    document.getElementById('leafCount').textContent = countLeaves(root);
}

// Traversals
function inorderTraversal(node, result = []) {
    if (node !== null) {
        inorderTraversal(node.left, result);
        result.push(node.value);
        inorderTraversal(node.right, result);
    }
    return result;
}

function preorderTraversal(node, result = []) {
    if (node !== null) {
        result.push(node.value);
        preorderTraversal(node.left, result);
        preorderTraversal(node.right, result);
    }
    return result;
}

function postorderTraversal(node, result = []) {
    if (node !== null) {
        postorderTraversal(node.left, result);
        postorderTraversal(node.right, result);
        result.push(node.value);
    }
    return result;
}

function levelorderTraversal(node) {
    if (node === null) return [];
    
    const result = [];
    const queue = [node];
    
    while (queue.length > 0) {
        const current = queue.shift();
        result.push(current.value);
        
        if (current.left !== null) queue.push(current.left);
        if (current.right !== null) queue.push(current.right);
    }
    
    return result;
}

function updateTraversals() {
    document.getElementById('inorder').textContent = 
        inorderTraversal(root).join(' → ') || '-';
    document.getElementById('preorder').textContent = 
        preorderTraversal(root).join(' → ') || '-';
    document.getElementById('postorder').textContent = 
        postorderTraversal(root).join(' → ') || '-';
    document.getElementById('levelorder').textContent = 
        levelorderTraversal(root).join(' → ') || '-';
}

// Draw tree
function drawTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (root === null) {
        ctx.fillStyle = '#8B7968';
        ctx.font = '18px Segoe UI';
        ctx.textAlign = 'center';
        ctx.fillText('Tree is empty. Insert nodes to visualize.', 
                     canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const positions = calculatePositions(root);
    drawConnections(positions);
    drawNodes(positions);
}

function calculatePositions(node) {
    const positions = new Map();
    const height = getHeight(node);
    const width = canvas.width;
    
    function calculate(node, level, left, right) {
        if (node === null) return;
        
        const x = (left + right) / 2;
        const y = 60 + level * Math.min(80, (canvas.height - 120) / Math.max(height - 1, 1));
        
        positions.set(node, { x, y });
        
        const mid = (left + right) / 2;
        calculate(node.left, level + 1, left, mid);
        calculate(node.right, level + 1, mid, right);
    }
    
    calculate(node, 0, 0, width);
    return positions;
}

function drawConnections(positions) {
    ctx.strokeStyle = '#D4CEC7';
    ctx.lineWidth = 2;
    
    function draw(node) {
        if (node === null) return;
        
        const pos = positions.get(node);
        
        if (node.left !== null) {
            const leftPos = positions.get(node.left);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(leftPos.x, leftPos.y);
            ctx.stroke();
            draw(node.left);
        }
        
        if (node.right !== null) {
            const rightPos = positions.get(node.right);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(rightPos.x, rightPos.y);
            ctx.stroke();
            draw(node.right);
        }
    }
    
    draw(root);
}

function drawNodes(positions) {
    function draw(node) {
        if (node === null) return;
        
        const pos = positions.get(node);
        const isHighlighted = highlightedNodes.has(node);
        
        // Draw circle
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 28, 0, Math.PI * 2);
        ctx.fillStyle = isHighlighted ? '#E8A87C' : '#C9B8A8';
        ctx.fill();
        ctx.strokeStyle = isHighlighted ? '#D4956B' : '#B8AA9E';
        ctx.lineWidth = 2.5;
        ctx.stroke();
        
        // Draw value
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Segoe UI';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(node.value, pos.x, pos.y);
        
        draw(node.left);
        draw(node.right);
    }
    
    draw(root);
}

// Show message
function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    
    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 3000);
}

// Allow Enter key for inputs
document.getElementById('insertInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') insertNode();
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchNode();
});

document.getElementById('deleteInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') deleteNode();
});

// Handle tree type change
document.getElementById('treeType').addEventListener('change', () => {
    if (root !== null) {
        showMessage('Tree type changed. Consider clearing the tree for proper structure.', 'info');
    }
});

// Initial draw
drawTree();