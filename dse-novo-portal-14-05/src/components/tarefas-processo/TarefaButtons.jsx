import { useState } from "react";
import { Dialog, DialogContent, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AguardandoForm from "./AguardandoForm";
import Scrollbar from "../Scrollbar";

export default function TarefaButtons({
  tarefa,
  salvarComoRascunho,
  isSubmitting,
  tarefaExterna,
}) {
  const [openAguardando, setOpenAguardando] = useState(false);
  const [submit1, setSubmit1] = useState(false);
  const [submit2, setSubmit2] = useState(false);
  const [submit3, setSubmit3] = useState(false);
  const [permissao, setPermissao] = useState(false);

  const sendCallback = (n, mensagem) => {
    if (!permissao) {
      if (n === 2) {
        setSubmit1(true);
      } else if (n === 3) {
        setSubmit2(true);
      } else if (n === 4) {
        setSubmit3(true);
      }
      salvarComoRascunho(n, mensagem);
    }
  };

  // useEffect(() => {
  //     if(usuario && usuario.tipo !== "Administrador" &&
  //         passo.papel_id !== 6 &&
  //         usuario.papeis.indexOf(passo.papel_id) === -1 &&
  //         usuario.id !== passo.responsavel_id){ // desabilita os botões caso o usuário não tenha permissão de execução da tarefa
  //         setPermissao(true)
  //     }
  // },[])

  return (
    <Scrollbar>
      <Stack spacing={1} direction="row" sx={{ mt: 3, minWidth: "570px" }}>
        <LoadingButton
          type="submit"
          variant="contained"
          disabled={permissao || submit1 || submit2 || submit3}
          loading={isSubmitting}
          sx={{
            color: (theme) => theme.palette.grey[0],
            backgroundColor: (theme) => theme.palette.success.dark,
          }}
        >
          Concluir Tarefa
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          startIcon={<PlayArrowIcon />}
          color="inherit"
          disabled={permissao || isSubmitting || submit2 || submit3}
          sx={{
            backgroundColor:
              tarefa.status === "Fazendo"
                ? (theme) => theme.palette.info.lighter
                : (theme) => theme.palette.grey[0],
            color:
              tarefa.status === "Fazendo"
                ? (theme) => theme.palette.info.dark
                : (theme) => theme.palette.grey[900],
          }}
          loading={submit1}
          onClick={() => sendCallback(2)}
        >
          Fazendo
        </LoadingButton>
        <LoadingButton
          variant="outlined"
          startIcon={<AccessTimeIcon />}
          color="inherit"
          sx={{
            backgroundColor:
              tarefa.status === "Aguardando"
                ? (theme) => theme.palette.warning.lighter
                : (theme) => theme.palette.grey[0],
            color:
              tarefa.status === "Aguardando"
                ? (theme) => theme.palette.warning.dark
                : (theme) => theme.palette.grey[900],
          }}
          disabled={permissao || isSubmitting || submit1 || submit3}
          onClick={() => setOpenAguardando(true)}
          loading={submit2}
        >
          Aguardando
        </LoadingButton>

        {/* comeco<LoadingButton 
                    variant='outlined' 
                    startIcon={<CancelOutlinedIcon/>} 
                    color='inherit'
                    sx={{ 
                        backgroundColor: tarefa.status === 'Não Concluído' ? 
                        (theme) => theme.palette.error.lighter : 
                        (theme) => theme.palette.grey[0] ,
                        color: tarefa.status === 'Não Concluído' ? 
                        (theme) => theme.palette.error.dark : 
                        (theme) => theme.palette.grey[900] ,
                    
                    }}
                    disabled={permissao || isSubmitting || submit1 || submit2 }
                    loading={submit3}
                    onClick={() => sendCallback(4)}
                > 
                    Não Concluído 
                </LoadingButton> fim*/}
      </Stack>
      <Dialog
        fullWidth
        maxWidth="md"
        open={openAguardando}
        onClose={() => setOpenAguardando(false)}
      >
        <DialogContent>
          <AguardandoForm
            callback={sendCallback}
            tarefa={tarefa}
            setOpen={setOpenAguardando}
          />
        </DialogContent>
      </Dialog>
    </Scrollbar>
  );
}
