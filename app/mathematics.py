from element import Element
from calculation import Calculation
import numpy as np
import math
import time 
import sys
import random

class Mathematics:
    def create_matrix(self, order):
        matrix = [[(order + 1 if x == y else 1) for x in range(order)] for y in range(order)]
        return matrix

    def inverse_numpy(self, array):
        start_time = time.time()

        matrix = np.array(array)
        inverse = np.linalg.inv(matrix)

        end_time = time.time()
        return (inverse.tolist(), (end_time - start_time))


    def inverse_gauss(self, array):
        order = len(array)
        range_order = range(order)
        range_2_order = range(2*order)
        range_order_2_order = range(order, 2*order)
        inverse = [[0 for x in range_order] for y in range_order]

        start_time = time.time()

        for i in range_order:
            for j in range_order_2_order:
                if j == (i + order):
                    array[i].append(1)
                else:
                    array[i].append(0)

        for i in range_order:
            for j in range_order:
                if i != j:
                    ratio = array[j][i] / array[i][i]
                    for k in range_2_order:
                        array[j][k] -= (ratio * array[i][k])

        for i in range_order:
            ratio = array[i][i]
            for j in range_order_2_order:
                array[i][j] /= ratio
                inverse[i][j - order] = array[i][j]

        end_time = time.time()
        return (inverse, (end_time - start_time))

    def calculate_intensities(self, calc):
        start_time = time.time()
        
        d_a = calc.element_a.dhkl if calc.element_a.dhkl != None else calc.d_a_custom
        d_b = calc.element_b.dhkl if calc.element_b.dhkl != None else calc.d_b_custom

        intensities = []
        for _2_theta in range(int(calc.theta_2_min * 100), int(calc.theta_2_max * 100) + 1):
            rad_2_theta = math.radians(_2_theta / 100)
            sin_2_theta = math.sin(rad_2_theta)
            cos_2_theta = math.cos(rad_2_theta)

            rad_theta = math.radians(_2_theta / 200)
            sin_theta = math.sin(rad_theta)

            s = sin_theta / calc.lambda_length
            
            sum_a = 0
            sum_b = 0
            for i in range(calc.n):
                for j in range(calc.n_a):
                    xj_a = i * (calc.n_a * d_a + calc.m_b * d_b) + d_a * j
                    sum_a += (np.exp(-calc.w_a * math.pow(s, 2)) * calc.g_a * np.exp(complex(0, 4 * math.pi * xj_a * s)))

                for j in range(calc.m_b):
                    xj_b = i * (calc.n_a * d_a + calc.m_b * d_b) + (calc.n_a * d_a) + (d_b * j)
                    sum_b += (np.exp(-calc.w_b * math.pow(s, 2)) * calc.g_b * np.exp(complex(0, 4 * math.pi * xj_b * s)))

            intensity = ((1 + math.pow(cos_2_theta, 2)) / (sin_theta * sin_2_theta)) * math.pow(abs(sum_a + sum_b), 2) if (sin_theta * sin_2_theta) != 0 else 0
            error = random.uniform(-calc.standard_error, calc.standard_error)
            intensity *= ((100 + error) / 100)
            intensities.append([_2_theta/100, intensity])

        end_time = time.time()

        return (intensities, (end_time - start_time))