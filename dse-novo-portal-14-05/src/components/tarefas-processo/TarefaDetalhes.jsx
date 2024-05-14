import { Stack, Typography, Box, Button } from "@mui/material";
import SelectResponsavel from "../SelectResponsavel";
import Label from "../Label";
import Prazo from "./Prazo";
import moment from "moment";
import createAvatar from "../../utils/createAvatar";
import MAvatar from "../MAvatar";
import IconButton from "@mui/material/IconButton";
import SaveIcon from "@mui/icons-material/Save";

export default function TarefaDetalhes({ tarefa }) {
  const labelColor =
    (tarefa.status === "Concluído" && "success") ||
    (tarefa.status === "Fazendo" && "info") ||
    (tarefa.status === "Aguardando" && "warning") ||
    (tarefa.status === "Não Concluído" && "error") ||
    "default";
  const nomePreenchido = tarefa.preenchido_nome?.split(" ");

  return (
    <Stack spacing={2}>
      <Box
        flexGrow={1}
        sx={{
          borderRadius: 2,
          border: 1,
          borderColor: (theme) => theme.palette.grey[400],
          pt: 3,
          pb: 3,
          pl: 2,
          pr: 2,
        }}
      >
        <Stack spacing={3}>
          <Typography variant="h6">Detalhes</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body2"
              sx={{ width: "134px", color: (theme) => theme.palette.grey[600] }}
            >
              Responsável
            </Typography>
            <SelectResponsavel passo={tarefa} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body2"
              sx={{ width: "134px", color: (theme) => theme.palette.grey[600] }}
            >
              Status
            </Typography>
            <Label color={labelColor}>{tarefa?.status}</Label>
          </Stack>
          {tarefa.estimativa && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="body2"
                sx={{
                  width: "134px",
                  color: (theme) => theme.palette.grey[600],
                }}
              >
                Prazo
              </Typography>
              <Prazo prazo={tarefa.estimativa} />
            </Stack>
          )}
          {tarefa.data_conclusao && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="body2"
                sx={{
                  width: "134px",
                  color: (theme) => theme.palette.grey[600],
                }}
              >
                Conclusão
              </Typography>
              <Typography
                variant="body2"
                color={(theme) => theme.palette.grey[900]}
              >
                {moment(tarefa.data_conclusao).format("DD/MM/YYYY-HH:mm")}
              </Typography>
            </Stack>
          )}
          {tarefa.preenchido_nome && (
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography
                variant="body2"
                sx={{
                  width: "134px",
                  color: (theme) => theme.palette.grey[600],
                }}
              >
                Concluído por
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <MAvatar
                  color={createAvatar(tarefa.preenchido_nome).color}
                  sx={{ width: 32, height: 32 }}
                  src={tarefa.avatar_preenchido ? tarefa.avatar_preenchido : ""}
                >
                  {createAvatar(tarefa.preenchido_nome).name}
                </MAvatar>
                <Typography
                  variant="body2"
                  sx={{ color: (theme) => theme.palette.grey[900] }}
                >
                  {nomePreenchido.shift()}{" "}
                  {nomePreenchido.length > 1 ? nomePreenchido.pop() : ""}
                </Typography>
              </Stack>
            </Stack>
          )}
          {/* <Stack direction='row'>
                    <Button variant='text' sx={{color: (theme) => theme.palette.success.dark}}>
                        Adicionar Detalhe
                    </Button>
                    <Box flexGrow={1}/>
                </Stack> */}
        </Stack>
      </Box>
      {tarefa.data_modificacao && (
        <Typography
          variant="body2"
          sx={{ pl: 2, color: (theme) => theme.palette.grey[600] }}
        >
          Atualizado em{" "}
          {moment(tarefa.data_modificacao).format("DD/MM/YYYY-HH:mm")}
        </Typography>
      )}
      
    </Stack>
  );
}
