// Documentação explicativa, ver para entender possiveis options https://developer.mozilla.org/en-US/docs/Web/API/Notification/Notification

export const requestPermissionNotification = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support desktop notification");
    return false
  } else {
    var permission = await Notification.requestPermission()
    return permission
  }
}

export const showNotification = (title, options) => {
  var permission = requestPermissionNotification()
  if (permission === "granted") {
    new Notification(title, options);
  }
}