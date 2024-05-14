export default function TarefaDetalhesIntegracao({ tarefa }) {
    return (
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
          <Typography variant="h6">Valores do campo de integração</Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body2"
              sx={{ width: "134px", color: (theme) => theme.palette.grey[600] }}
            >
              Chave 1
            </Typography>
            <SelectResponsavel passo={tarefa} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography
              variant="body2"
              sx={{ width: "134px", color: (theme) => theme.palette.grey[600] }}
            >
              Chave 2
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
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography
              variant="body2"
              sx={{
                width: "190px",
                color: (theme) => theme.palette.grey[900],
              }}
            >
              <Button startIcon={<SaveIcon />}>Arquivo Simulado</Button>
            </Typography>
          </Stack>
        </Stack>
      </Box>
    )
}