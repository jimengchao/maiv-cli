
const { execSync } = require('child_process')
const fs =require('fs');
const figlet = require('figlet');/* *********************** 生成asc码的包*/ 
const Printer = require('@darkobits/lolcatjs');/* ********* 做渐变色的包*/
const program = require('commander');/* ******************* 和用户交互的包*/
const inquirer = require('inquirer');/* ******************* 和用户交互的包*/
const chalk = require('chalk');/* ************************* 说话变颜色的包*/
const json2ts = require('json2ts');/* ********************* 把json转换成ts的包*/
const ora = require('ora');/* ***************************** 添加loading等待的包*/
const MAIV = figlet.textSync('MAIV');
// const spinner = require('spinner');
// const userHome = require('user-home');
const shell = require('shelljs');
const download = require("download-git-repo");
const templateUrl = 'direct:https://github.com/jimengchao/vuejs-simple-template.git'
// const didYouMean = require('didyoumean')

// 版本号
const tipsText = MAIV + '\n' + '  maiv 脚手架'

// 选项
program.option("-i, --init", "初始化vue项目")
program.option("-json2ts", "生成ts类型文件")

const bindHandler = {
    init(){
        console.log('初始化项目')
        inquirer.prompt([
            {
                type: "text",
                message: "请输入项目名称",
                name: 'dirname'
            },
            // {
            //     type:"list",
            //     name: 'jskind',
            //     message: "请使用该项目语言",
            //     choices:["ES6", "TypeScript"]
            // },
            {
                type:"list",
                name: 'installMode',
                message: "选择安装方式",
                choices:["Npm", "Cnpm", "Yarn"]
            }
        ]).then(answers => {
            let { dirname, jskind, installMode } = answers;
            dirname = dirname || 'app-demo'
            if( dirname ) {
                const _pwd = shell.pwd().stdout;

                // 检查 git
                if( !hasGit() ) {
                   return console.info('您还没有安装git， 请先安装');
                }

                // 检查 名字是否冲突
                if( !checkName(_pwd, dirname) ){
                    return console.log(`当前文件夹存在${dirname}文件夹`);
                }

                const spinner = ora("稳住,正在帮小爷生成项目...");
                spinner.start();
                const __projectPath = `${_pwd}/${dirname}`;
                shell.cd(_pwd);
                shell.rm("-rf", __projectPath);
                shell.mkdir(dirname);

                download(templateUrl, __projectPath, {
                    clone: true
                },err => {
                    spinner.stop();
                    if( err ){
                        console.error("项目下载失败:", err.message);
                    }else{
                        shell.sed("-i", "vuejs-simple-template", dirname, __projectPath+"/package.json");
                        console.log(chalk.green("项目克隆成功"));
                        if( !hasIntallMode(installMode) ){
                            return console.info(`您还没有安装 ${installMode}，请自行安装项目`);
                        }else{
                            console.info(`正在为您安装`);
                            install(installMode, `./${dirname}`);
                        }
                    }
                })
            }
        })
    },
    json2ts(jsonUrl){
        console.log("接口地址:", jsonUrl);
        // loading
        const spinner = ora("稳住,正在帮小爷生成代码...");
        spinner.start();
        const jsonContent = {
            code: 1,
            info: {
                message: '请求成功',
                data:[{
                    num: 1
                }]
            }
        }
        let result = json2ts.convert(JSON.stringify(jsonContent));
        console.log(result);
    }
}

program
    .version(Printer.default.fromString(tipsText), "-v, --version")
    .usage('<cmd> [options]')
    .arguments("<cmd> [env]")
    .action(function(cmd, otherParams){
        const handler = bindHandler[cmd];
        if(handler){
            handler(otherParams);
        }else{
            console.log(chalk.yellow("你输入的") + chalk.red(cmd) + chalk.yellow("我不认识"))
        }
    })

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp()
}

// 检查是否存在重名
function checkName(path, projectName){
    return fs.readdirSync(path).every(item => item !== projectName);
}

// install 项目
function install(installMode, dirname){
    try {
        shell.cd(dirname);
        execSync(`${installMode.toLocaleLowerCase()} install`, { stdio: 'inherit' });
    } catch {
        console.log(chalk.red(`安装失败！`));
        process.exit(1);
    }
}

// 检查 安装方式
function hasIntallMode(mode){
    try {
        execSync(`${mode.toLocaleLowerCase()} --version`, { stdio: 'ignore' })
        return true
    } catch (e) {
        return false
    }
}

// 判断是安装 git
function hasGit(){
    try {
        execSync('git --version', { stdio: 'ignore' })
        return true
    } catch (e) {
        process.exit(1);
    }
}