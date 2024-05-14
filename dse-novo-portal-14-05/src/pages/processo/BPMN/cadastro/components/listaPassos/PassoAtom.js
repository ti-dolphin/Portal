import {atom, useAtom } from "jotai";

export const Passos = atom(null);

export const Passo = atom(null)

/// camposIndexed deve ser alterado acada vez que passos for alterado
export const CamposIndexed = atom((get) => {
    return get(Passos) ? get(Passos).reduce((acc, passo, index) => {
        passo?.campos?.forEach((campo, indexCampo) => {
            acc[campo.id] = campo
        });
        return acc;
    }, {})
    : {}
})