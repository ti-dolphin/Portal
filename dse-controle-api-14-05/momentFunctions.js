const moment = require('moment-business-time')

moment.locale('pt-br', {
    workinghours: {
        0: null,
        1: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        2: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        3: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        4: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        5: ['08:00:00', '12:00:00', '13:00:00', '18:00:00'],
        6: null
    }
});

class MomentFunctions{

    static getPrazo(estimativa){
        const novoPrazo = moment(moment(new Date()).addWorkingTime(estimativa, 'hours')).format("YYYY/MM/DD HH:mm:ss");
        return novoPrazo;
    }

    static dateTimeAtual(){
        return moment(new Date()).format("YYYY/MM/DD HH:mm:ss")
    }

}
  
module.exports = MomentFunctions