import numpy as np
import time 
import sys

def inverse_numpy(order, matrix):
    start_time = time.time()

    matrix = np.array(array)
    inverse = np.linalg.inv(matrix)

    end_time = time.time()

    print('Czas obliczeń:', str(end_time - start_time), 's.')

    if order < 11:
        print("Macierz odwrotna:")
        print(inverse)


def inverse_gauss(order, matrix):
    inverse = [[0 for x in range(order)] for y in range(order)]
    start_time = time.time()

    for i in range(order):
        for j in range(order, 2*order):
            if j == (i + order):
                matrix[i].append(1)
            else:
                matrix[i].append(0)

    for i in range(order):
        for j in range(order):
            if i != j:
                ratio = matrix[j][i] / matrix[i][i]
                for k in range(2*order):
                    matrix[j][k] -= (ratio * matrix[i][k])

    for i in range(order):
        ratio = matrix[i][i]
        for j in range(order, 2*order):
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
    inverse_numpy(order, array)

print()
array = [[(order + 1 if x == y else 1) for x in range(order)] for y in range(order)]

if len(sys.argv) == 1 or sys.argv[1] == 'gauss':
    print('Obliczanie macierzy odwrotnej z wykorzystaniem eliminacji Gaussa...', '\n')
    inverse_gauss(order, array)
    print()