from calc import Math
from flask import Flask, jsonify, request
import os
import json 

with open('data/interplanar-distances.json', encoding='utf-8') as f:
    interplanar_distances = json.load(f)

class Server:
    def __init__(self):  
        self.app = Flask(__name__, static_url_path='', static_folder='../static')
        self.port = int(os.environ.get("PORT", 5000))
        self.math = Math()
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

        @self.app.route('/diffraction-intensities')
        def calculate_intensities():
            d_a = int(request.args.get('dA'))
            d_b = int(request.args.get('dB'))
            n_a = int(request.args.get('nA'))
            m_b = int(request.args.get('mB'))
            n = int(request.args.get('N'))
            theta_2_min = int(request.args.get('2ThetaMin'))
            theta_2_max = int(request.args.get('2ThetaMax'))
            y_scale = int(request.args.get('yScale'))
            intensities_tuple = self.math.calculate_intensities(d_a, d_b, n_a, m_b, n, theta_2_min, theta_2_max, y_scale)
            return jsonify(
                intensities=intensities_tuple[0],
                time=intensities_tuple[1]
            )

        @self.app.route('/elements')
        def get_element():
            search_term = request.args.get('searchTerm').lower()
            result = {}
            for key in interplanar_distances.keys():
                if search_term in key.lower():
                    result[key] = interplanar_distances[key]
            return jsonify(result)
    
    def run_server(self):
        self.app.run(host='0.0.0.0', port=self.port)
        