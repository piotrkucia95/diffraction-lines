from calc import Math
from flask import Flask, jsonify, request
import os
import json 

with open('data/interplanar-distances.json', encoding='utf-8') as f:
    interplanar_distances = json.load(f)


app = Flask(__name__, static_url_path='')

math = Math()

@app.route('/')
def index():
    return app.send_static_file('index.html')

@app.route('/matrix-inverse/gauss/<order>')
def matrix_inverse_gauss(order):
    matrix = math.create_matrix(int(order))
    inverse_tuple = math.inverse_gauss(matrix)
    return jsonify(
        inverse=inverse_tuple[0] if int(order) <= 10 else [],
        time=inverse_tuple[1]
    )

@app.route('/matrix-inverse/numpy/<order>')
def matrix_inverse_numpy(order):
    matrix = math.create_matrix(int(order))
    inverse_tuple = math.inverse_numpy(matrix)
    return jsonify(
        inverse=inverse_tuple[0] if int(order) <= 10 else [],
        time=inverse_tuple[1]
    )

@app.route('/diffraction-intensities')
def calculate_intensities():
    d_a = float(request.args.get('dA'))
    d_b = float(request.args.get('dB'))
    n_a = int(request.args.get('nA'))
    m_b = int(request.args.get('mB'))
    n = int(request.args.get('N'))
    theta_2_min = round(float(request.args.get('2ThetaMin')), 2)
    theta_2_max = round(float(request.args.get('2ThetaMax')), 2)
    y_scale = int(request.args.get('yScale'))
    intensities_tuple = self.math.calculate_intensities(d_a, d_b, n_a, m_b, n, theta_2_min, theta_2_max, y_scale)
    return jsonify(
        intensities=intensities_tuple[0],
        time=intensities_tuple[1]
    )

@app.route('/elements')
def get_element():
    search_term = request.args.get('searchTerm').lower()
    result = {}
    for key in interplanar_distances.keys():
        if search_term in key.lower():
            result[key] = interplanar_distances[key]
    return jsonify(result)