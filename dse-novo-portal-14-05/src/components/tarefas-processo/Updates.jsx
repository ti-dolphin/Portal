import { useState, useEffect } from 'react'
import { TabContext, TabPanel } from '@mui/lab';
import { Typography, Box, Tab, Tabs, Card, CardContent } from '@mui/material';
import UpdatesList from './UpdatesList'
import { dispatch, useSelector } from '../../redux/store'
import { getProcessNotifications } from '../../redux/slices/notification'

export default function Updates({ process_id }) {
    const { processNotifications } = useSelector((state) => state.notification);
    const [atualizacoes, setAtualizacoes] = useState([{ value: 0, label: 'Atualizações', data: [] }])
    const [value, setValue] = useState(0);

    const getData = async () => {
        dispatch(getProcessNotifications(process_id));
    }

    useEffect(() => getData(), []);

    useEffect(() => {
        setAtualizacoes([{ value: 0, label: 'Atualizações', data: processNotifications }])
    }, [processNotifications])

    return (
        <TabContext value={value}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mt: 1 }}>
                <Tabs
                    value={value}
                    onChange={(e, newValue) => setValue(newValue)}
                    variant="scrollable"
                    scrollButtons={false}
                >
                    {atualizacoes.map((tab, index) => (
                        <Tab key={tab.value} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {atualizacoes.map((panel, index) => (
                <TabPanel key={panel.value} value={panel.value}>
                    <Box mb={2} />
                    {panel.data.length > 0 ?
                        <UpdatesList data={panel.data} />
                        :
                        <Card>
                            <CardContent>
                                <Typography variant='h5'>
                                    Nada para mostrar.
                                </Typography>
                            </CardContent>
                        </Card>
                    }
                </TabPanel>
            ))}
        </TabContext>
    )
}