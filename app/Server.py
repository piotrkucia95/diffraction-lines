from Math import Math
from Database import Database
from Element import Element
from Calculation import Calculation
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

        @self.app.route('/elements', methods=['GET'])
        def get_element():
            search_term = request.args.get('searchTerm')
            results = self.db.search_elements(search_term)
            return jsonify(results)

        @self.app.route('/elements', methods=['POST'])
        def add_element():
            p = request.get_json()
            new_element = Element(p["name"], p["symbol"], p["dhkl"], p["displayName"], '')
            self.db.add_element(new_element)
            return 'Element added!'

        @self.app.route('/diffraction-intensities', methods=['POST'])
        def calculate_intensities():
            p = request.get_json()
            el_a = Element('', '', p["dA"], '', p["elementAId"])
            el_b = Element('', '', p["dB"], '', p["elementBId"])
            calc = Calculation('', el_a, el_b, p["nA"], p["mB"], p["n"], p["wA"], p["wB"], p["gA"], p["gB"], p["theta2Min"], p["theta2Max"], False, None)
            intensities_tuple = self.math.calculate_intensities(calc)
            self.db.save_calculation(calc)
            return jsonify(
                intensities=intensities_tuple[0],
                time=intensities_tuple[1]
            )

        @self.app.route('/calculations', methods=['GET'])
        def get_calculations():
            results = self.db.get_calculations()
            return jsonify(results) 

        @self.app.route('/calculations/<id>', methods=['PATCH'])
        def update_calculation(id):
            calc = self.db.update_calculation(id)
            intensities_tuple = self.math.calculate_intensities(calc)
            return jsonify(
                intensities=intensities_tuple[0],
                time=intensities_tuple[1]
            )
    
        @self.app.route('/calculations/<id>', methods=['DELETE'])
        def delete_calculation(id):
            self.db.delete_calculation(id)
            return 'Calculation removed!'

    def run_server(self):
        self.app.run(host='0.0.0.0', port=self.port)
        