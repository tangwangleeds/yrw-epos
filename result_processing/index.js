const fs = require("fs");
const log4js = require("log4js");
const csv = require('csvtojson')
const xlsx = require('xlsx')

function create_logger(filename) {
    let date = new Date();
    let [day_str, date_str] = date.toISOString()
        .split('T');
    date_str = date_str.replace(/:/g, '-')
        .replace(/\./g, '-')
    let log_path = `/${day_str}/${filename}-${date_str}.log`;

    log4js.configure({
        appenders: {
            out: {
                type: 'file',
                filename: './logs' + log_path,
                encoding: 'utf8',
                layout: { type: 'basic' },
            },
            console: {
                type: 'stdout',
                layout: { type: 'basic' },
            },
        },
        categories: {
            default: {
                appenders: ['out', 'console'],
                level: 'all',
            },
        },
    });
    return log4js.getLogger('yrw_logger');
}

async function main() {
    Date.prototype.format = function (fmt) {
        let o = {
            "M+": this.getMonth() + 1,                 //月份
            "d+": this.getDate(),                    //日
            "h+": this.getHours(),                   //小时
            "m+": this.getMinutes(),                 //分
            "s+": this.getSeconds(),                 //秒
            "q+": Math.floor((this.getMonth() + 3) / 3), //季度
            "S": this.getMilliseconds()             //毫秒
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
        }
        for (let k in o) {
            if (new RegExp("(" + k + ")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            }
        }
        return fmt;
    }


    /**
     * 配置参数
     */
    //输出文件夹path，结尾不需要加'/'
    const output_path = "/Users/wurining/Documents/吴日宁/1-Leeds/学习资料/1-5111 Bigdata System/Assessment/CW/yrw-epos/output";
    //统计结果输出位置
    const result_path = "./result";
    //全局cost函数文件名
    const global_cost_filename = "global-cost.csv";
    //全局a,b函数文件名
    const alpha_bate_filename = "weights-alpha-beta.csv";

    //初始化Logger
    let l = create_logger('result_processing');
    l.info('开始处理...');

    // 读取文件夹
    let folders = [];
    let raw_folders = fs.readdirSync(output_path);
    raw_folders.forEach((value, index) => {
        if (value === '.DS_Store') {
            l.info('发现MACOS的.DS_Store文件。Index=' + index);
        } else if (!fs.statSync(output_path + '/' + value).isDirectory()) {
            l.info('非文件夹。Index=' + index);
        } else {
            folders.push(value)
        }
    })

    l.info('文件夹已加载');
    l.info('文件数：' + folders.length);
    l.info('文件列表：' + folders.toString());

    // 读取每个cost
    // 读取配置
    l.info('开始处理...');
    try {
        l.info('读取数据...');
        let result = [];
        for (const folder of folders) {
            let json = await csv().fromFile(`${output_path}/${folder}/${global_cost_filename}`);
            let json2 = await csv().fromFile(`${output_path}/${folder}/${alpha_bate_filename}`);
            json = json.pop();
            json2 = json2.pop();
            json.folder = folder;
            let run_key = [];
            Object.getOwnPropertyNames(json).filter((val) => {
                return val.match("Run-")
            }).forEach((val) => {
                run_key.push(json[val])
            })
            json.min = Math.min(...run_key)
            for (key of Object.getOwnPropertyNames(json)) {
                if (key.match("Run-"))
                    delete json[key]
            }
            json.alpha = json2["Unfairness weight"]
            json.beta = json2["Local cost weight"]
            result.push(json)
            // l.info(json);
        }
        // 排序
        l.info('数据排序...');
        result = result.sort((a, b) => {
            return Number.parseFloat(a.min) <= Number.parseFloat(b.min) ? -1 : 1;
        })

        l.info('导出excel...');
        let date_str = new Date().format("yyyy-MM-dd-hh-mm-ss");
        console.log(date_str);
        let header = Object.getOwnPropertyNames(result[0]);
        let data = [header];
        for (let item of result) {
            let row = [];
            header.forEach((val) => {
                row.push(item[val])
            })
            data.push(row)
        }

        let workSheet = xlsx.utils.aoa_to_sheet(data);
        let workbook = xlsx.utils.book_new();
        await xlsx.utils.book_append_sheet(workbook, workSheet, 'result');

        xlsx.writeFile(workbook, `${result_path}/result_${date_str}.xlsx`);

    } catch (e) {
        l.error(e);
    } finally {
        l.info('处理结束...');
    }
}

new Promise(() => {
    (async () => {
        await main();
    })()
}).then(() => {
    console.log("over")
})