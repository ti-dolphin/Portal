import { useEffect } from 'react';
import { Breadcrumbs, Link, Typography, Stack } from '@mui/material'


export default function BreadcrumbDocumentList({ path, callback }){

    return(
        <Breadcrumbs>
            {path.length > 0 ?
                <Link color="inherit" onClick={() => callback(null)}>
                    Início
                </Link>
                :
                <Typography sx={{ color: 'text.primary' }}>Início</Typography>
            }
            {path.map((link, index ) =>
                index !== (path.length - 1) ? 
                <Link key={'link_'+link.id} color="inherit" onClick={() => callback(link.id)}>
                    {link.nome}
                </Link>
                :
                <Typography key={'link_'+link.id} sx={{ color: 'text.primary' }}>{link.nome}</Typography>
            )}
        </Breadcrumbs>
    )
}