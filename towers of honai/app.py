"""
Flask API Backend for Towers of Hanoi
Connects the stack-based backend with the frontend visualizer
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os

# ==================== STACK IMPLEMENTATION ====================
class Stack:
    """Simple Stack implementation for a tower"""
    
    def __init__(self):
        self.items = []
    
    def push(self, disk):
        self.items.append(disk)
    
    def pop(self):
        if not self.is_empty():
            return self.items.pop()
        return None
    
    def is_empty(self):
        return len(self.items) == 0
    
    def get_all(self):
        return self.items.copy()


class TowersOfHanoi:
    """Towers of Hanoi solver using stacks"""
    
    def __init__(self, n_disks):
        self.n_disks = n_disks
        self.towers = [Stack(), Stack(), Stack()]
        
        # Initialize Tower A with all disks
        for disk in range(n_disks, 0, -1):
            self.towers[0].push(disk)
        
        self.moves = []
        self.move_count = 0
    
    def solve(self):
        self.moves = []
        self.move_count = 0
        self._hanoi(self.n_disks, 0, 2, 1)
        return self.moves
    
    def _hanoi(self, n, source, target, auxiliary):
        if n == 1:
            self._move_disk(source, target)
            return
        
        self._hanoi(n - 1, source, auxiliary, target)
        self._move_disk(source, target)
        self._hanoi(n - 1, auxiliary, target, source)
    
    def _move_disk(self, from_tower, to_tower):
        disk = self.towers[from_tower].pop()
        self.towers[to_tower].push(disk)
        
        self.move_count += 1
        move = {
            'moveNumber': self.move_count,
            'disk': disk,
            'from': from_tower,
            'to': to_tower,
            'state': self.get_current_state()
        }
        self.moves.append(move)
    
    def get_current_state(self):
        return [
            self.towers[0].get_all(),
            self.towers[1].get_all(),
            self.towers[2].get_all()
        ]


# ==================== FLASK API ====================
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

@app.route('/')
def index():
    """Serve API documentation"""
    return jsonify({
        'message': 'Towers of Hanoi API',
        'endpoints': {
            '/api/solve': 'POST - Solve Towers of Hanoi puzzle',
            '/api/health': 'GET - Check API health'
        },
        'example': {
            'endpoint': '/api/solve',
            'method': 'POST',
            'body': {'n_disks': 3}
        }
    })

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'message': 'Towers of Hanoi API is running'
    })

@app.route('/api/solve', methods=['POST'])
def solve():
    """
    Solve Towers of Hanoi puzzle
    
    Request body:
    {
        "n_disks": 3
    }
    
    Response:
    {
        "success": true,
        "n_disks": 3,
        "total_moves": 7,
        "moves": [...]
    }
    """
    try:
        data = request.get_json()
        
        if not data or 'n_disks' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing n_disks parameter'
            }), 400
        
        n_disks = int(data['n_disks'])
        
        # Validate input
        if n_disks < 1:
            return jsonify({
                'success': False,
                'error': 'n_disks must be at least 1'
            }), 400
        
        if n_disks > 10:
            return jsonify({
                'success': False,
                'error': 'n_disks cannot exceed 10 (too many moves)'
            }), 400
        
        # Solve the puzzle
        hanoi = TowersOfHanoi(n_disks)
        moves = hanoi.solve()
        
        return jsonify({
            'success': True,
            'n_disks': n_disks,
            'total_moves': len(moves),
            'expected_moves': (2 ** n_disks) - 1,
            'moves': moves
        })
    
    except ValueError:
        return jsonify({
            'success': False,
            'error': 'Invalid n_disks value. Must be an integer.'
        }), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/validate-move', methods=['POST'])
def validate_move():
    """
    Validate if a move is legal
    
    Request body:
    {
        "state": [[3,2,1], [], []],
        "from": 0,
        "to": 2
    }
    """
    try:
        data = request.get_json()
        state = data.get('state')
        from_tower = data.get('from')
        to_tower = data.get('to')
        
        if state is None or from_tower is None or to_tower is None:
            return jsonify({
                'valid': False,
                'error': 'Missing required parameters'
            }), 400
        
        # Check if source tower has disks
        if not state[from_tower]:
            return jsonify({
                'valid': False,
                'reason': 'Source tower is empty'
            })
        
        # Check if move is valid (smaller disk on top)
        disk_to_move = state[from_tower][-1]
        if state[to_tower] and state[to_tower][-1] < disk_to_move:
            return jsonify({
                'valid': False,
                'reason': 'Cannot place larger disk on smaller disk'
            })
        
        return jsonify({
            'valid': True,
            'disk': disk_to_move
        })
    
    except Exception as e:
        return jsonify({
            'valid': False,
            'error': str(e)
        }), 500


# ==================== RUN SERVER ====================
if __name__ == '__main__':
    PORT = 8000
    print("=" * 60)
    print("TOWERS OF HANOI - FLASK API SERVER")
    print("=" * 60)
    print("\nServer starting...")
    print(f"API will be available at: http://localhost:{PORT}")
    print("\nEndpoints:")
    print("  GET  /              - API documentation")
    print("  GET  /api/health    - Health check")
    print("  POST /api/solve     - Solve puzzle")
    print("  POST /api/validate-move - Validate a move")
    print("\nExample usage:")
    print(f"  curl -X POST http://localhost:{PORT}/api/solve \\")
    print("       -H 'Content-Type: application/json' \\")
    print("       -d '{\"n_disks\": 3}'")
    print("\n" + "=" * 60)
    print(f"\nStarting server on port {PORT}...")
    print("Press CTRL+C to stop the server\n")
    
    try:
        app.run(debug=True, host='0.0.0.0', port=PORT)
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"\n❌ ERROR: Port {PORT} is already in use!")
            print("Please stop the other application or choose a different port.")
        else:
            print(f"\n❌ ERROR: {e}")