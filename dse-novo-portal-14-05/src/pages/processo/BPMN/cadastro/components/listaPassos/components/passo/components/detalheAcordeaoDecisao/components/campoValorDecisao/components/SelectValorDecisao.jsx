import { useState, useMemo } from "react";
import { useAtom } from "jotai";
import { Passos } from "../../../../../../../PassoAtom";
import update from "immutability-helper";

import {
  TextField,
  Autocomplete,
  FormControl,
} from "@mui/material";

/**
 *
 * @param {string} estado Estado que o seletor irá atualizar
 * @param {function} callback Função de Callback do seletor
 * @param {array} dados Dados que o seletor deverá listar
 *
 */

export default function SelectValorDecisao(props) {
  const [passos, setPassos] = useAtom(Passos);

  const getSelecionado = () => {
    let result = null;
    props.campoSelecionado.processo_campo_opcao_select.forEach((op) => {
      if (
        op.value ===
        passos[props.index].processo_fluxo_cadastro[props.indexFluxo].condicoes[
          props.indexDecisao
        ].valor_condicao
      ) {
        result = op;
        return;
      }
    });
    return result;
  };

  const [selecionado, setSelecionado] = useState(getSelecionado());

  const selectedValue = useMemo(() => {
    return selecionado;
  }, [selecionado]);

  const options = useMemo(() => {
    return props.campoSelecionado.processo_campo_opcao_select;
  }, [ props.campoSelecionado.processo_campo_opcao_select ]);

  const editaValorCondicao = (newValue) => {
    // ISSO FAZ COM QUE REBUILDE TUDO!!! PRECISA????
    setPassos(
      update(passos, {
        [props.index]: {
          // id do passo
          processo_fluxo_cadastro: {
            [props.indexFluxo]: {
              condicoes: {
                [props.indexDecisao]: {
                  valor_condicao: {
                    $set: newValue ? newValue.value : null,
                  },
                },
              },
            },
          },
        },
      })
    );
  };
  return (
    <FormControl variant="outlined" sx={{ width: "100%" }}>
      <Autocomplete
        value={selectedValue}
        options={options}
        getOptionLabel={(option) => option.label || ""}
        isOptionEqualToValue={(option, value) => option.id === value.id}
        onChange={(event, newValue) => {
          setSelecionado(newValue);
          editaValorCondicao(newValue);
        }}
        renderInput={(params) => {
            return (
                <TextField {...params} label={"Valor do campo"} variant="outlined" />
              )
        }}
      />
    </FormControl>
  );
}
