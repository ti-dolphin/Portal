import { useState } from "react";
import { Typography, Stack, TextField } from "@mui/material";
import { GetSession } from "../../session";
import { useSelector, useDispatch } from "../../redux/store";
import { sendPassoComent, getPassoComents } from "../../redux/slices/step";
import MAvatar from "../MAvatar";
import Loading from "../Loading";
import Scrollbar from "../Scrollbar";
import createAvatar from "../../utils/createAvatar";
import Coment from "./Coment";
import { notification } from "../notification/notiflix";

export default function TarefaComents({ tarefa }) {
  const dispatch = useDispatch();
  const usuario = GetSession("@dse-usuario");
  const [isLoading, setIsLoading] = useState(false);
  const { passoComents } = useSelector((state) => state.step);

  const sendComent = async (e) => {
    if (e.keyCode == 13) {
      if (!e.shiftKey) {
        setIsLoading(true);
        e.preventDefault();
        await dispatch(
          sendPassoComent({
            processo_passo_id: tarefa.id,
            usuario_id: usuario.id,
            processo_id: tarefa.processo_id,
            comentario: e.target.value,
          })
        );
        e.target.value = "";
        await dispatch(getPassoComents(tarefa.id));
        setIsLoading(false);
        notification("success", "Comentário enviado com sucesso!");
      }
    }
  };

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Loading open={isLoading} />
      <Typography variant="h5">Comentários</Typography>
      <Scrollbar>
        <Stack sx={{ maxHeight: "300px" }} spacing={2}>
          {passoComents.map((comentario, index) => {
            return (
              <Coment tarefa={tarefa} comentario={comentario} index={index} />
            );
          })}
        </Stack>
      </Scrollbar>
      <Stack direction="row" spacing={2}>
        <MAvatar
          src={usuario.nome?.photoURL}
          alt={usuario.nome?.nome}
          color={
            usuario.nome?.photoURL
              ? "default"
              : createAvatar(usuario.nome).color
          }
          sx={{ width: 32, height: 32 }}
        >
          {createAvatar(usuario.nome).name}
        </MAvatar>

        <TextField
          maxRows={2}
          onKeyDown={sendComent}
          multiline
          fullWidth
          placeholder="Adicionar Comentário..."
        />
      </Stack>
    </Stack>
  );
}
