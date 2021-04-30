import subprocess
import chardet
import sys
import threading
import time


class Runnable(object):
    def __init__(self, _jar_name, _conf, _alpha, _bate):
        self.jar_name = _jar_name
        self.conf = _conf
        self.alpha = _alpha
        self.bate = _bate
        self.java_command = "java"
        self.java_command_para = "-jar"

    def run(self):
        cmd = [self.java_command, self.java_command_para,
               self.jar_name, self.conf, self.alpha, self.bate]
        new_cmd = " ".join(cmd)
        print(f"Running {new_cmd}")
        proc = subprocess.Popen(new_cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                                shell=True)
        stdout, stderr = proc.communicate()
        # status = proc.wait()
        encoding = chardet.detect(stdout)["encoding"]
        # result = stdout.decode(encoding)
        result = stdout.decode(sys.stdout.encoding)
        print(f"Received! {result}")
        return result


class JavaThread(threading.Thread):
    def __init__(self, _jar_name, _conf, _alpha, _bate):
        threading.Thread.__init__(self)
        self.jar_name = _jar_name
        self.conf = _conf
        self.alpha = _alpha
        self.bate = _bate

    def run(self):
        print('开始线程:%s' % (self.getName()))
        AES = Runnable(self.jar_name, self.conf, self.alpha, self.bate)
        AES.run()
        print('结束线程:%s' % (self.getName()))


def getABParam(start, end, step=10):
    unit = (end - start)/step
    return [round(start+unit*i, 6) for i in range(step+1)]


if __name__ == '__main__':
    # java -jar name.jar "/Users/wurining/Documents/吴日宁/1-Leeds/学习资料/1-5111 Bigdata System/Assessment/CW/yrw-epos/conf/epos.test.properties" "0.1" "0.2"
    golden_section = 0.618
    jar_name = "tutorial-0.0.1.jar"
    conf = '"/Users/wurining/Documents/吴日宁/1-Leeds/学习资料/1-5111 Bigdata System/Assessment/CW/yrw-epos/conf/epos.test.properties"'
    # alpha = '"0.1"'
    # bate = '"0.2"'

    count = 0
    start, end = 0, 1

    for next_val in range(5):
        for alpha in getABParam(start, end):
            threads = []  # 创建线程列表
            # 创建新线程
            for bate in getABParam(0, 1-alpha):
                threads.append(JavaThread(
                    jar_name, conf, f'"{alpha}"', f'"{bate}"'))
            for t in threads:
                t.start()
                print(f'Starting {alpha},{bate}===========================')
                time.sleep(1)
            for t in threads:
                t.join()
        find_next_start_end(check_result())

    # print(getABParam(0, 0.0000314))
