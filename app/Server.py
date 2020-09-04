from mathematics import Mathematics
from database import Database
from element import Element
from calculation import Calculation
from flask import Flask, jsonify, request
import os

class Server:
    def __init__(self):  
        self.app = Flask(__name__, static_url_path='', static_folder='../static')
        self.port = int(os.environ.get("PORT", 5000))
        self.mathematics = Mathematics()
        self.db = Database()
        self.set_routes() 
        self.run_server()
           
    def set_routes(self):
        @self.app.route('/')
        def send_index():
            return self.app.send_static_file('index.html')

        @self.app.route('/basic-calculations')
        def send_basic_calculations():
            return self.app.send_static_file('basic-calculations.html')

        @self.app.route('/advanced-calculations')
        def send_advanced_calculations():
            return self.app.send_static_file('advanced-calculations.html')

        @self.app.route('/matrix-inversion')
        def send_matrix_inversion():
            return self.app.send_static_file('matrix-inversion.html')

        @self.app.route('/matrix-inverse/gauss/<order>')
        def matrix_inverse_gauss(order):
            matrix = self.mathematics.create_matrix(int(order))
            inverse_tuple = self.mathematics.inverse_gauss(matrix)
            return jsonify(
                inverse=inverse_tuple[0] if int(order) <= 10 else [],
                time=inverse_tuple[1]
            )

        @self.app.route('/matrix-inverse/numpy/<order>')
        def matrix_inverse_numpy(order):
            matrix = self.mathematics.create_matrix(int(order))
            inverse_tuple = self.mathematics.inverse_numpy(matrix)
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

        @self.app.route('/calculations', methods=['POST'])
        def calculate_intensities():
            p = request.get_json()
            if p["advanced"] == False:
                el_a = Element('', '', p["dA"], '', '')
                el_b = Element('', '', p["dB"], '', '')
                calc = Calculation('', False, el_a, el_b, p["nA"], p["mB"], p["n"], 0, 0, 1, 1, p["theta2Min"], p["theta2Max"], None, None, None, 1.54)
            else:
                el_a = Element('', '', p["dA"], '', p["elementAId"])
                el_b = Element('', '', p["dB"], '', p["elementBId"])
                calc = Calculation('', True, el_a, el_b, p["nA"], p["mB"], p["n"], p["wA"], p["wB"], p["gA"], p["gB"], 
                                   p["theta2Min"], p["theta2Max"], None, p["dA"], p["dB"], p["lambda"])

            intensities_tuple = self.mathematics.calculate_intensities(calc)
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
            intensities_tuple = self.mathematics.calculate_intensities(calc)
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
        