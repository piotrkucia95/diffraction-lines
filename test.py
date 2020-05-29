import time 

order = int(input("Stopień macierzy: "))

matrix = [[(order + 1 if x == y else 1) for x in range(order)] for y in range(order)]
inverse = [[0 for x in range(order)] for y in range(order)]
ratio = 0

if order < 10:
    print("Macierz wejściowa:")
    print(matrix)

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

if order < 10:
    print("Macierz odwrotna:")
    print(inverse)