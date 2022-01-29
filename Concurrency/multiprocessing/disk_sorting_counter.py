import sys
import collections
from timeit import default_timer as timer

MAXINT = 100000

def sort():
    """ Sort files on disk by using a counter """
    counter = collections.defaultdict(int)
    for i in range(int(sys.argv[1])):
        filename = 'numbers/numbers_%d.txt' % i
        print('Sorting numbers_%d.txt...' % i)
        for n in open(filename):
            counter[n] += 1
            # print('Sorting...')
            with open('sorted_nums.txt', 'w') as fp:
                for j in range(1, MAXINT+1):
                    count = counter.get(str(j) + '\n', 0)
                    if count>0:
                        fp.write((str(j)+'\n')*count)
                        # print('Sorted')
                    # print('no number exists in numbers_%d.txt' % i)
        print('Sorted numbers_%d.txt' % i)


    
if __name__ == '__main__':
    start_time = timer()
    sort()
    print('Sorting time using Counter: ', round(timer() - start_time, 2), 's')

# python3 disk_files_sorting.py 3 
# 3 is the number of the number files to be sorted / looped