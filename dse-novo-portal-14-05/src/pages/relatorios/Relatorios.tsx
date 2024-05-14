import Page from "../../components/Page";
import {
  Container,
  Grid,
  Stack,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import Header from "../../components/Header";
import Loading from "../../components/Loading";
import useRelatorio from "./hooks/Relatorio.hook";
import { Icon } from "@iconify/react";
import searchFill from "@iconify/icons-eva/search-fill";
import TaskTabs from "./components/RelatorioTabs";

import ActionAreaCard from "./components/RelatorioCards";

export default function Relatorios() {
  const relatorioHook = useRelatorio();

  return (
    <>
      <Page title="Relatorios">
        <Loading open={relatorioHook.isLoading} />
        <Container maxWidth={false}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Box flex={2}>
              <Header
                title="RELATÓRIOS"
                subtitle=""
                buttons={[]}
                image={false}
                options={false}
              />
            </Box>

            <TextField
              value={relatorioHook.search}
              onChange={(e) => {
                relatorioHook.setSearch(e.target.value);
              }}
              placeholder="Pesquisar..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box
                      component={Icon}
                      icon={searchFill}
                      sx={{ color: "text.disabled" }}
                    />
                  </InputAdornment>
                ),
              }}
            />
          </Stack>
          {/* <TaskTabs relatorioHook={relatorioHook} /> */}
          <Box mt={2} />
          <Grid container direction="row" spacing={2}>
            <Grid item xs={12} md={6} lg={4}>
              <ActionAreaCard
                toggleFavorite={relatorioHook.toggleFavorite}
                name={"Documentos a vencer/vencidos"}
                onClick={() => relatorioHook.callbackCard()}
                relatorioHook={relatorioHook}
              />
            </Grid>
          </Grid>
        </Container>
      </Page>
    </>
  );
}
