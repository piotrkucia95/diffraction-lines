import numpy as np
import time 
import sys

class Math:
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