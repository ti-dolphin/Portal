import React, { lazy } from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { useAtom } from "jotai";
import { Passos } from "../../../../PassoAtom";
import update from "immutability-helper";
import SelectCampoPasso from "../detalheAcordeao/components/acordeaoCampo/components/detalheAcordeaoCampo/components/arquivo/components/SelectCampoPasso";
import CampoValorDecisao from "./components/campoValorDecisao/CampoValorDecisao";

import {
  Grid,
  Typography,
  Card,
  CardContent,
  Box,
  IconButton,
} from "@mui/material";

export default function DetalheAcordeaoDecisao(props) {
  const [passos, setPassos] = useAtom(Passos);

  const findNome = (passoId) => {
    if (passoId && passoId !== null) {
      const found = passos.find((element) => element.id === passoId);
      if (found.nome) {
        return found.nome;
      } else {
        return "";
      }
    } else {
      return "";
    }
  };

  const editaProcessoCampoCadastroID = (
    campoPasso,
    indexFluxo,
    indexCondicao
  ) => {
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [indexFluxo]: {
              condicoes: {
                [indexCondicao]: {
                  processo_campo_cadastro_id: {
                    $set: campoPasso.campoId,
                  },
                },
              },
            },
          },
        },
      })
    );
  };

  const resetaProcessoCampoCadastroID = (indexFluxo, indexCondicao) => {
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [indexFluxo]: {
              condicoes: {
                [indexCondicao]: {
                  processo_campo_cadastro_id: {
                    $set: null,
                  },
                  valor_condicao: {
                    $set: "",
                  },
                },
              },
            },
          },
        },
      })
    );
  };

  const adicionaCondicao = (indexFluxo) => {
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [indexFluxo]: {
              condicoes: {
                $push: [
                  {
                    condicao: "sim",
                    valor_condicao: "",
                    status: "Ativo",
                    passo_atual:
                      passos[props.index].processo_fluxo_cadastro[indexFluxo]
                        .passo_atual,
                    passo_seguinte:
                      passos[props.index].processo_fluxo_cadastro[indexFluxo]
                        .passo_seguinte,
                    passo_decisao: passos[props.index].id,
                    processo_campo_cadastro_id: null,
                    processo_cadastro_id:
                      passos[props.index].processo_cadastro_id,
                  },
                ],
              },
            },
          },
        },
      })
    );
  };

  const removeCondicao = (indexFluxo, indexCondicao) => {
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [indexFluxo]: {
              condicoes: {
                // $splice: [[indexCondicao,1]]
                $unset: [indexCondicao],
              },
            },
          },
        },
      })
    );
  };

  const buildCard = (row, indexFluxo) => {
    return (
      <>
        <Card>
          <CardContent>
            <Box>
              <Grid container spacing={3}>
                <Grid item lg={3} md={4} sm={5} xs={6}>
                  <Grid container spacing={0}>
                    <Grid item lg={4} md={4} sm={4} xs={4}>
                      <Typography>{findNome(row.passo_atual)}</Typography>
                    </Grid>

                    <Grid item lg={4} md={4} sm={4} xs={4}>
                      <ArrowForwardIcon />
                    </Grid>

                    <Grid item lg={4} md={4} sm={4} xs={4}>
                      <Typography>
                        {row.passo_seguinte !== 0
                          ? findNome(row.passo_seguinte)
                          : "Fim"}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item lg={8} md={7} sm={6} xs={3}></Grid>

                <Grid item lg={1} md={1} sm={1} xs={3}>
                  <IconButton onClick={() => adicionaCondicao(indexFluxo)}>
                    <AddIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>

            <Box mb={2} />

            <Box>
              <Grid container spacing={3}>
                {
                  row.condicoes.map(function buildCondition(
                    condicao,
                    indexCondicao
                  ) {
                    return (
                      <React.Fragment key={"detalheAcordeao_" + indexCondicao}>
                        <Grid item lg={6} md={6} sm={12} xs={12}>
                            <SelectCampoPasso
                              valorInicial={condicao.processo_campo_cadastro_id ? condicao.processo_campo_cadastro_id : false}
                              callback={(campoPasso)=>editaProcessoCampoCadastroID(campoPasso,indexFluxo,indexCondicao)}
                              reset={()=>resetaProcessoCampoCadastroID(indexFluxo,indexCondicao)}
                            />
                          </Grid>
                        <Grid item lg={5} md={5} sm={11} xs={10}>
                          <CampoValorDecisao
                            index={props.index}
                            indexFluxo={indexFluxo}
                            indexDecisao={indexCondicao}
                          />
                        </Grid>
                        <Grid item lg={1} md={1} sm={1} xs={2}>
                            <IconButton onClick={()=>removeCondicao(indexFluxo,indexCondicao)}>
                              <CloseIcon fontSize='small' />
                            </IconButton>
                          </Grid>
                      </React.Fragment>
                    );
                  })
                }
              </Grid>
            </Box>
          </CardContent>
        </Card>
        <Box mb={2} />
      </>
    );
  };

  return (
    <Grid container spacing={0}>
      <Grid item lg={2} md={2} sm={0} xs={0} />

      <Grid item lg={8} md={8} sm={12} xs={12}>
        {passos[props.index].processo_fluxo_cadastro.map(buildCard)}
      </Grid>
    </Grid>
  );
}
