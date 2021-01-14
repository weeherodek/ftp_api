const schedule = require('node-schedule');
const MainController = require('../controllers/mainController');



class Schedule{
    static async updateImage(){
        const rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(0,6)];
        rule.hour = 2;
        rule.minute = 0;
        
        const job = schedule.scheduleJob(rule,()=>{
            MainController.getImages;
        })
    }

    static async updateGif(){
        const rule = new schedule.RecurrenceRule();
        rule.dayOfWeek = [0, new schedule.Range(0,6)];
        rule.hour = 2;
        rule.minute = 15;
        
        const job = schedule.scheduleJob(rule,()=>{
            MainController.generateGif;
        })
    }
}

module.exports = Schedule;