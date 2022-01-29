def is_prime(n):
    """ Check for input number primality """

    for i in range(3, int(n**0.5+1), 2):
        if n % i == 0:
            print(n, 'is not prime')
            return False

    print(n, 'is prime')
    return True


numbers = [1297337, 1116281, 104395303, 472882027, 533000389, 817504243, 982451653, 112272535095293, 115280095190773, 1099726899285419]*3

import multiprocessing
from timeit import default_timer as timer

def main():
    start_time = timer()
    pool = multiprocessing.Pool(2)
    pool.map(is_prime, numbers)
    print('Time used with multiprocessing', round(timer() - start_time, 2), 's')

if __name__ == '__main__':
    main()