
import numpy as np
import codecs
import csv
import random




array_DBS = random.sample(range(0,1000),1000)

print(array_DBS)
# /Users/wangyu/Desktop/利兹上课资料/BigDataSystem/CW/CODE/cw_4_17/conf/permutation.csv
Path = '/Users/wangyu/Desktop/利兹上课资料/BigDataSystem/CW/CODE/cw_4_17/'

file_name = 'permutation.csv'

def data_write_csv(file_name, datas):

    file_csv = codecs.open(file_name,'w+','utf-8')
    writer = csv.writer(file_csv)

    for data in datas:
        writer.writerow([str(data)])
    print("😄csv has been done, please check")


data_write_csv(Path+file_name,array_DBS)