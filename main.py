import numpy as np
import time 
import sys

def inverse_numpy(matrix):
    start_time = time.time()

    array = np.array(matrix)
    inverse = np.linalg.inv(array)

    end_time = time.time()

    print('Czas obliczeń:', str(end_time - start_time), 's.')

    if len(matrix) < 11:
        print("Macierz odwrotna:")
        print(inverse)


def inverse_gauss(matrix):
    order = len(matrix)
    range_order = range(order)
    range_2_order = range(2*order)
    range_order_2_order = range(order, 2*order)
    inverse = [[0 for x in range_order] for y in range_order]

    start_time = time.time()

    for i in range_order:
        for j in range_order_2_order:
            if j == (i + order):
                matrix[i].append(1)
            else:
                matrix[i].append(0)

    for i in range_order:
        for j in range_order:
            if i != j:
                ratio = matrix[j][i] / matrix[i][i]
                for k in range_2_order:
                    matrix[j][k] -= (ratio * matrix[i][k])

    for i in range_order:
        ratio = matrix[i][i]
        for j in range_order_2_order:
            matrix[i][j] /= ratio
            inverse[i][j - order] = matrix[i][j]

    end_time = time.time()

    print('Czas obliczeń:', str(end_time - start_time), 's.')

    if order < 11:
        print("Macierz odwrotna:")
        print(np.array(inverse))
        

order = int(input("Stopień macierzy: "))
array = [[(order + 1 if x == y else 1) for x in range(order)] for y in range(order)]

if order < 11:
    print()
    print("Macierz wejściowa:")
    print(np.array(array))
    print()

if len(sys.argv) == 1 or sys.argv[1] == 'numpy':
    print('Obliczanie macierzy odwrotnej z wykorzystaniem biblioteki NumPy...', '\n')
    inverse_numpy(array)
    print()

if len(sys.argv) == 1 or sys.argv[1] == 'gauss':
    array = [[(order + 1 if x == y else 1) for x in range(order)] for y in range(order)]
    print('Obliczanie macierzy odwrotnej z wykorzystaniem eliminacji Gaussa...', '\n')
    inverse_gauss(array)
    print()