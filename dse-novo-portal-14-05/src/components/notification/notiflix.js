// import Notiflix from "notiflix-react/dist/notiflix-react-1.4.0";
import Notiflix from "notiflix";
// import "notiflix-react/dist/notiflix-react-1.4.0.css";

/**
 * @param {String} type warning | success | error | info
 * @param {String} message Mensagem a ser exibida 
*/
export const notification = (type, message) => {
    // Notiflix.Notify.Init({});
    switch(type) {
        case 'warning':
            Notiflix.Notify.warning(message,{
                timeout: 1500
            });
            break
        case 'success':
            Notiflix.Notify.success(message,{
                timeout: 1500
            });
            break
        case 'error':
            Notiflix.Notify.failure(message,{
                timeout: 1500
            });
            break
        case 'info':
            Notiflix.Notify.info(message,{
                timeout: 1500
            });
            break
        case 'errorOnly':
            Notiflix.Notify.failure(message, {
                showOnlyTheLastOne: true,
                timeout: 1500
                });
            break
        case 'successOnly':
            Notiflix.Notify.success(message,{
                showOnlyTheLastOne: true,
                timeout: 1500
                });
            break
    }
}