from Math import Math
from Database import Database
from flask import Flask, jsonify, request
import os

class Server:
    def __init__(self):  
        self.app = Flask(__name__, static_url_path='', static_folder='../static')
        self.port = int(os.environ.get("PORT", 5000))
        self.math = Math()
        self.db = Database()
        self.set_routes() 
        self.run_server()
           
    def set_routes(self):
        @self.app.route('/')
        def index():
            return self.app.send_static_file('index.html')

        @self.app.route('/matrix-inverse/gauss/<order>')
        def matrix_inverse_gauss(order):
            matrix = self.math.create_matrix(int(order))
            inverse_tuple = self.math.inverse_gauss(matrix)
            return jsonify(
                inverse=inverse_tuple[0] if int(order) <= 10 else [],
                time=inverse_tuple[1]
            )

        @self.app.route('/matrix-inverse/numpy/<order>')
        def matrix_inverse_numpy(order):
            matrix = self.math.create_matrix(int(order))
            inverse_tuple = self.math.inverse_numpy(matrix)
            return jsonify(
                inverse=inverse_tuple[0] if int(order) <= 10 else [],
                time=inverse_tuple[1]
            )

        @self.app.route('/elements')
        def get_element():
            search_term = request.args.get('searchTerm')
            results = self.db.search_elements(search_term)
            elements = []
            for result in results:
                elements.append({
                    "id"          : result[4],
                    "displayName" : result[3],
                    "dhkl"        : result[2]
                })
            return jsonify(elements)

        @self.app.route('/diffraction-intensities', methods=['POST'])
        def calculate_intensities():
            params = request.get_json()
            intensities_tuple = self.math.calculate_intensities(params)
            self.db.save_calculations(params)
            return jsonify(
                intensities=intensities_tuple[0],
                time=intensities_tuple[1]
            )

        @self.app.route('/calculations', methods=['GET'])
        def get_calculations():
            return jsonify(self.db.get_calculations()) 
    
    def run_server(self):
        self.app.run(host='0.0.0.0', port=self.port)
        