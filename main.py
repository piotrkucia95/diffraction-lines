from mathematics import Mathematics
from database import Database
from element import Element
from calculation import Calculation
from flask import Flask, jsonify, request
import os

app = Flask(__name__, static_url_path='')

mathematics = Mathematics()
db = Database()

@app.route('/')
def send_index():
    return app.send_static_file('index.html')

@app.route('/basic-calculations')
def send_basic_calculations():
    return app.send_static_file('basic-calculations.html')

@app.route('/advanced-calculations')
def send_advanced_calculations():
    return app.send_static_file('advanced-calculations.html')

@app.route('/matrix-inversion')
def send_matrix_inversion():
    return app.send_static_file('matrix-inversion.html')

@app.route('/matrix-inverse/gauss/<order>')
def matrix_inverse_gauss(order):
    matrix = mathematics.create_matrix(int(order))
    inverse_tuple = mathematics.inverse_gauss(matrix)
    return jsonify(
        inverse=inverse_tuple[0] if int(order) <= 10 else [],
        time=inverse_tuple[1]
    )

@app.route('/matrix-inverse/numpy/<order>')
def matrix_inverse_numpy(order):
    matrix = mathematics.create_matrix(int(order))
    inverse_tuple = mathematics.inverse_numpy(matrix)
    return jsonify(
        inverse=inverse_tuple[0] if int(order) <= 10 else [],
        time=inverse_tuple[1]
    )

@app.route('/elements', methods=['GET'])
def get_element():
    search_term = request.args.get('searchTerm')
    results = db.search_elements(search_term)
    return jsonify(results)

@app.route('/elements', methods=['POST'])
def add_element():
    p = request.get_json()
    new_element = Element(p["name"], p["symbol"], p["dhkl"], p["displayName"], '')
    db.add_element(new_element)
    return 'Element added!'

@app.route('/calculations', methods=['POST'])
def calculate_intensities():
    p = request.get_json()
    el_a = Element('', '', p["dA"], '', p["elementAId"])
    el_b = Element('', '', p["dB"], '', p["elementBId"])
    if p["advanced"] == False:
        calc = Calculation('', False, el_a, el_b, p["nA"], p["mB"], p["n"], 0, 0, 1, 1, p["theta2Min"], p["theta2Max"], None, None, None, 1.54, 0)
    else:
        calc = Calculation('', True, el_a, el_b, p["nA"], p["mB"], p["n"], p["wA"], p["wB"], p["gA"], p["gB"], 
                            p["theta2Min"], p["theta2Max"], None, p["dA"], p["dB"], p["lambda"], p["error"])

    intensities_tuple = mathematics.calculate_intensities(calc)
    db.save_calculation(calc)
    return jsonify(
        intensities=intensities_tuple[0],
        time=intensities_tuple[1]
    )

@app.route('/calculations', methods=['GET'])
def get_calculations():
    advanced = request.args.get('advanced')
    results = db.get_calculations(advanced)
    return jsonify(results) 

@app.route('/calculations/<id>', methods=['PATCH'])
def update_calculation(id):
    calc = db.update_calculation(id)
    intensities_tuple = mathematics.calculate_intensities(calc)
    return jsonify(
        intensities=intensities_tuple[0],
        time=intensities_tuple[1]
    )

@app.route('/calculations/<id>', methods=['DELETE'])
def delete_calculation(id):
    db.delete_calculation(id)
    return 'Calculation removed!'