import { 
    TableCell, 
} from '@mui/material';

export default function FolderAttributesTableRowContent({ attribute }){
    return(
        <>
            <TableCell >{attribute.id}</TableCell>
            <TableCell >{attribute.atributo}</TableCell>
            <TableCell >{attribute.mask && attribute.mask != 'null' ? attribute.mask : attribute.tipo}</TableCell>
            <TableCell >{attribute.categoria}</TableCell>
            <TableCell >{attribute.isnull === "Nao" ? "Obrigatório" : "Opcional"}</TableCell>
            <TableCell >{attribute.flag_filha === 1 ? "Sim" : "Não"}</TableCell>
        </> 
    )
}