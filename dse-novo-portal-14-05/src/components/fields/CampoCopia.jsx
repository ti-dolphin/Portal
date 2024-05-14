import React from 'react';
import { Icon } from '@iconify/react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Tooltip, Stack, IconButton, InputAdornment, Grid, Box, Typography  } from '@mui/material';
import CustomMaskField from '../fields/CustomMaskField'
import SelectFieldTarefa from '../fields/SelectFieldTarefa'
import CelField from '../fields/CelField'
import CepField from '../fields/CepField'
import CpfCnpjField from '../fields/CpfCnpjField'
import DateField from '../fields/DateField'
import NumberField from '../fields/NumberField'
import CustomTextField from '../fields/CustomTextField'
import TextAreaField from '../fields/TextAreaField'
import CampoCopiaArchiveAttributes from '../fields/CampoCopiaArchiveAttributes'
import Label from '../Label';



export default function CampoCopia({ field, disabled, fieldProps, error, helperText, refArray }){
    const SwitchField = (field) => {

        switch (field.campo_copia.tipo) {

            case 'Data de vencimento':
                return (
                        <DateField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Área de texto':
                return(
                        <TextAreaField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Celular':
                return (
                        <CelField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Cep':
                return (
                        <CepField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'CPF/CNPJ':
                return (
                        <CpfCnpjField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Moeda':
                return (
                        <NumberField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Número':
                return (
                        <NumberField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Data':
                return (
                        <DateField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )

            case 'Seleção':
                    return (
                        <SelectFieldTarefa
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            options={field.campo_copia.opcoes}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                        />
                    )
            
            case 'Texto com máscara personalizada':
                return(
                    <CustomMaskField
                        disabled={disabled || field.campo_copia.editavel !== 1}
                        mask={field.campo_copia.mascara.mascara}
                        label={field.nome}
                        placeholder={field.nome}
                        error={error}
                        helperText={helperText}
                        fieldProps={fieldProps}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                <CopyToClipboard text={fieldProps.value}>
                                    <Tooltip title="Copiar">
                                    <IconButton>
                                        <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                    </IconButton>
                                    </Tooltip>
                                </CopyToClipboard>
                                </InputAdornment>
                            )
                            }}
                    />
                )

            case 'Arquivo':
                var ref = React.createRef();
                refArray.push(ref)
                return(
                  field.campo_copia.arquivos?.arquivo &&
                    <Grid item xs={12} mb={2}>
                        <Typography variant='overline'>
                            {field.nome}
                        </Typography>
                        <Box mb={2}/>
                        <CampoCopiaArchiveAttributes
                            ref={ref}
                            editavel={field.campo_copia.editavel === 1}
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            arquivo={field.campo_copia.arquivos}
                            diretorio={field.campo_copia.caminho.projeto_pasta_id}
                            categoria={field.campo_copia.caminho.categoria_id}
                        />
                    </Grid>
                )

            case 'Multi-Seleção':
                return(
                    <SelectFieldTarefa
                        disabled={disabled || field.campo_copia.editavel !== 1}
                        options={field.campo_copia.opcoes}
                        label={field.nome}
                        placeholder={field.nome}
                        error={error}
                        helperText={helperText}
                        fieldProps={fieldProps}
                    />
                )
        
            default:
                return (
                        <CustomTextField
                            disabled={disabled || field.campo_copia.editavel !== 1}
                            label={field.nome}
                            placeholder={field.nome}
                            error={error}
                            helperText={helperText}
                            fieldProps={fieldProps}
                            InputProps={{
                                endAdornment: (
                                  <InputAdornment position="end">
                                    <CopyToClipboard text={fieldProps.value}>
                                      <Tooltip title="Copiar">
                                        <IconButton>
                                          <Icon icon={'fluent:copy-24-regular'} width={24} height={24} />
                                        </IconButton>
                                      </Tooltip>
                                    </CopyToClipboard>
                                  </InputAdornment>
                                )
                              }}
                        />
                )
        }

    }

    return(
        <Grid item xs={12} mb={2}>
            <Stack spacing={2} direction='row' alignItems='center'>
                {SwitchField(field)}
                {field.campo_copia.tipo !== 'Arquivo' &&
                    <Label color={field.valor ? field.valor !== field.campo_copia.valor ? 'success' : 'default' : field.campo_copia.valor !== fieldProps.value ? 'success' : 'default'}>
                        Ref
                    </Label>
                }
            </Stack>
        </Grid>
    )
}