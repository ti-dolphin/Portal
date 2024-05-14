import { createSlice } from '@reduxjs/toolkit';
import "firebase/compat/firestore";
import { api } from '../../config'
import { GetSession } from '../../session';
import { dataAtual } from 'src/utils/utils';
import { dispatch } from '../store';
import uuidv4 from 'src/utils/uuidv4';
import { db } from 'src/api/firebase_service';
import moment from 'moment';

export const pushNotificationModel = {
  newTask: {
    title: 'Nova Tarefa',
    body: () => `Você possui uma nova tarefa.`  
  },
  taskLate: {
    title: 'Tarefa atrasada',
    body: (taskName: string, userName: string) => `A tarefa ${taskName} de ${userName} se encontra ATRASADA.`  
  },
  taskUpdates: {
    title: (processName: string, processDescription: string) => `${processName}: ${processDescription}`,
    body: (processId: string, taskDate: string, taskName: string, projectName: string) => 
    `ID: ${processId} - Data: ${moment(taskDate).format("DD/MM/YYYY")}\nProjeto: ${projectName}\nTarefa: ${taskName}`
  },
  userFollowProcess: {
    title: 'Acompanhamento de Processo',
    body: (processName: string) => `Você está acompanhando o processo ${processName}.` 
  },
  otherUserFollowProcess: {
    title: 'Acompanhamento de Processo',
    body: (userName: string, processName: string) => `${userName} está acompanhando o processo ${processName}.` 
  },
  waitingProcess: {
    title: 'Processo em Aguardo',
    body: (processName: string, userName: string, userName2: string) => `O processo ${processName} de ${userName} está em aguardo por: ${userName2}.`  
  },
  doingProcess: {
    title: 'Processo em Andamento',
    body: (processName: string, userName: string, userName2: string) => `O processo ${processName} de ${userName} está sendo feito por: ${userName2}.`  
  },
  initializedProcess: {
    title: `Processo Iniciado`,
    body: (processName: string, processDescription: string, processId: string, processEndDate: string, projectName: string) => 
    `${processName}: ${processDescription}\nID: ${processId} - Data: ${moment(processEndDate).format("DD/MM/YYYY")}\nProjeto: ${projectName}`
  },
  finishedProcess: {
    title: `Processo Concluído`,
    body: (processName: string, processDescription: string, processId: string, processEndDate: string, projectName: string) => 
    `${processName}: ${processDescription}\nID: ${processId} - Data: ${moment(processEndDate).format("DD/MM/YYYY")}\nProjeto: ${projectName}`
  },
}

type NotificationState = {
  isLoading: boolean,
  error: any | null,
  unreadUserNotificationsQuantity: number,
  unreadProcessNotificationsQuantity: number,
  userNotifications: Array<Notification>
  processNotifications: Array<Notification>
};

export type Notification = {
  id: any,
  ator: any,
  usuario_id: any,
  processo_id: any,
  tipo: any,
  nome: any,
  read: any,
  data: any,
  post_id: any,
  dataNow: any,
};

export type PushNotification = {
  title: string
  body: string
  ids: Array<number>
}

const initialState: NotificationState = {
  isLoading: false,
  error: null,
  unreadUserNotificationsQuantity: 0,
  unreadProcessNotificationsQuantity: 0,
  userNotifications: [],
  processNotifications: [],
};

const slice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getUserNotificationsSuccess(state, action) {
      state.isLoading = false;
      state.userNotifications = action.payload;
      state.unreadUserNotificationsQuantity = action.payload.filter((notification: any) => notification.read === false).length
    },
    getProcessNotificationsSuccess(state, action) {
      state.isLoading = false;
      state.processNotifications = action.payload;
      state.unreadProcessNotificationsQuantity = action.payload.filter((notification: any) => notification.read === false).length
    },
  },
});

export default slice.reducer;

export function getUserNotifications(documentId: string) {
  return async () => {
    try {
      dispatch(slice.actions.startLoading());
      const documentData = await db.collection('notifications').doc(documentId).get();
      const data = documentData.data();
      data?.notifications.sort((a: any, b: any) => b.dataNow - a.dataNow);
      dispatch(slice.actions.getUserNotificationsSuccess(data?.notifications ?? []));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  }
}

export function getProcessNotifications(processId: string) {
  return async () => {
    try {
      dispatch(slice.actions.startLoading());
      const result = await db.collection("notifications").where("processId", "==", processId).get();
      const documents = result.docs.map((doc) => doc.data());
      const notifications = documents[0]?.notifications;
      notifications.sort((a: any, b: any) => b.dataNow - a.dataNow);
      dispatch(slice.actions.getProcessNotificationsSuccess(notifications ?? []));
    } catch (error) {
      console.error(error);
      dispatch(slice.actions.hasError(error));
    }
  }
}

export function markNotificatiosAsRead(documentId: string) {
  return async () => {
    try {
      const documentData = await db.collection('notifications').doc(documentId).get();
      const data = documentData.data();
      if (data) {
        const notificationsUpdated = data.notifications.map((notification: any) => ({ ...notification, read: true }));
        await db.collection('notifications').doc(documentId).update({ notifications: notificationsUpdated });
      }
      return true;
    } catch (error) {
      console.error(error);
    }
  };
}

async function saveUserNotification(notification: Notification) {
  try {
    const result = await db.collection("notifications").where("userId", "==", notification.usuario_id).get();
    const documentId = result.docs[0].ref.id;
    const documentData = await db.collection('notifications').doc(documentId).get();
    const data = documentData.data();
    if (data) {
      data.notifications.push(notification);
      await db.collection('notifications').doc(documentId).update(data);
    }
    return true;
  } catch (error) {
    console.error(error);
  }
}

async function saveProcessNotification(notification: Notification) {
  try {
    const result = await db.collection("notifications").where("processId", "==", String(notification.processo_id)).get();
    const documentId = result.docs[0].ref.id;
    const documentData = await db.collection('notifications').doc(documentId).get();
    const data = documentData.data();
    if (data) {
      data.notifications.push(notification);
      await db.collection('notifications').doc(documentId).update(data);
    }
    return true;
  } catch (error) {
    console.error(error);
  }
}

export function findOrCreateUserCollection(userId: string) {
  return async () => {
    try {
      const result = await db.collection("notifications").where("userId", "==", userId).get();
      if (result.docs.length > 0) {
        const id = result.docs[0].ref.id;
        return id;
      } else {
        const documentData = await db.collection('notifications').add({ userId: userId, notifications: [] });
        const id = documentData.id;
        return id;
      }
    } catch (error) {
      console.error(error);
    }
  };
}

export function findOrCreateProccessCollection(processId: string) {
  return async () => {
    try {
      const result = await db.collection("notifications").where("processId", "==", processId).get();
      if (result.docs.length > 0) {
        const id = result.docs[0].ref.id;
        return id;
      } else {
        const documentData = await db.collection('notifications').add({ processId: processId, notifications: [] });
        const id = documentData.id;
        return id;
      }
    } catch (error) {
      console.error(error);
    }
  };
}

export function sendNotificationToUser(title: string, body: any, processo_id: string, papel_id: any, tipo: any, nome: any, status: string, ids: Array<string>, emails: Array<string>) {
  return async () => {
    try {
      const usuario = GetSession("@dse-usuario");

      // notificação para os usuários vinculados ao processo
      for (const id of ids) {
        const notification = {
          id: uuidv4(),
          ator: title,
          usuario_id: id,
          processo_id: processo_id,
          tipo: tipo, // 0 Conclusão de tarefa, 1 alteração de status, 2 incio de processo
          nome: body,
          post_id: 0,
          read: false,
          data: dataAtual(),
          dataNow: Date.now()
        };
        await saveUserNotification(notification);
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendNotification(title: string, body: any, processo_id: string, papel_id: any, tipo: any, nome: any, status: string, ids: Array<string>, emails: Array<string>) {
  return async () => {
    try {
      const usuario = GetSession("@dse-usuario");
      // await sendEmailNotification({ title, body, emails });

      // notificação para os usuários vinculados ao processo
      // for (const id of ids) {
      //   const notification = {
      //     id: uuidv4(),
      //     ator: usuario?.nome ? usuario.nome : 'Externo',
      //     usuario_id: id,
      //     processo_id: processo_id,
      //     tipo: tipo, // 0 Conclusão de tarefa, 1 alteração de status, 2 incio de processo
      //     nome: nome,
      //     post_id: 0,
      //     read: false,
      //     data: dataAtual(),
      //     dataNow: Date.now()
      //   };
      //   await saveUserNotification(notification);
      // }
      // notificação do processo
      const notification = {
        id: uuidv4(),
        ator: usuario?.nome ? usuario.nome : 'Externo',
        usuario_id: 'Processo',
        processo_id: processo_id,
        tipo: tipo, // 0 Conclusão de tarefa, 1 alteração de status, 2 incio de projeto
        status: status,
        nome: nome,
        post_id: 0,
        read: false,
        data: dataAtual(),
        dataNow: Date.now()
      };
      await saveProcessNotification(notification);
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendNotificationPost(post: any, post_id: any) {
  return async () => {
    try {
      const users = await getUsersGrupo(post.comunidade_id);
      const ids = users.map((user: any) => user.usuario_id);
      post.usuarios.forEach((user: any) => {
        if (ids.indexOf(user.value) === -1) {
          ids.push(user.value)
        }
      });
      await sendPushNotification({ title: "Novo post realizado", body: `Título: ${post.titulo}`, ids });
      await saveNotificationsPost(ids, 3, post.titulo, post_id)
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendNotificationLikePost(post_id: number) {
  return async () => {
    try {
      const usuario = GetSession("@dse-usuario");
      const post = await getPost(post_id);
      if (post) {
        await sendPushNotification({ title: "Seu Post recebeu um like", body: `O usuário ${usuario.nome} curtiu o seu post ${post.titulo}`, ids: [post.usuario_id] });
        await saveNotificationsPost([post.usuario_id], 4, post.titulo, post_id)
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendNotificationCommentPost(post_id: number) {
  return async () => {
    try {
      const usuario = GetSession("@dse-usuario");
      const post = await getPost(post_id);
      if (post) {
        await sendPushNotification({ title: "Seu Post recebeu um comentário", body: `O usuário ${usuario.nome} comentou no seu post ${post.titulo}`, ids: [post.usuario_id] });
        await saveNotificationsPost([post.usuario_id], 5, post.titulo, post_id)
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function sendNotificationReplyCommentPost(post_id: number, user_id: number) {
  return async () => {
    try {
      const usuario = GetSession("@dse-usuario");
      const post = await getPost(post_id);
      if (post) {
        const body = `O usuário ${usuario.nome} respondeu seu comentário no post ${post.titulo}`
        const ids = [user_id]
        await sendPushNotification({ title: "Seu comentário recebeu uma resposta", body: body, ids: ids });
        await saveNotificationsPost(ids, 6, post.titulo, post_id);
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export async function saveNotificationsPost(ids: Array<number>, tipo: any, nome: string, postId: number) {
  try {
    const usuario = GetSession("@dse-usuario");
    for (const id of ids) {
      const notifications = {
        id: uuidv4(),
        ator: usuario?.nome ? usuario.nome : '',
        usuario_id: id,
        processo_id: '',
        tipo: tipo, // 0 Conclusão de tarefa, 1 alteração de status, 2 incio de projeto, 3 criação de post, 4 curtiu post, 5 comentou post, 6 respondeu comentário
        nome: nome,
        read: false,
        data: dataAtual(),
        post_id: postId,
        dataNow: Date.now(),
      };
      saveUserNotification(notifications);
    }
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function sendPushNotification(body: PushNotification) {
  try {
    await api.post('comunicacao/push', body);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function sendEmailNotification(body: any) {
  try {
    await api.post('comunicacao/sendMail', body);
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getUsersGrupo(communityId: number) {
  try {
    const response = await api.get(`usuario-grupo/selectUsersGrupo/${communityId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getUsersToNotificate(processId: number, paperId: number) {
  try {
    const response = await api.get(`comunicacao/usersToNotificate/${processId}/${paperId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getPost(post_id: number) {
  try {
    const response = await api.get(`post/${post_id}`);
    return response.data[0] ?? null;
  } catch (error) {
    throw error;
  }
}