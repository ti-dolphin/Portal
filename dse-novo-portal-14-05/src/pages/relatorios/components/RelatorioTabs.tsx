import { Tab, Tabs } from "@mui/material";
import Label from "src/components/Label";

export default function TaskTabs({ relatorioHook }: any) {
    const TABS = [
        {label: "Geral", value: 0},
        {label: "Favoritos", value: 1}
    ]
    
    return(
        <Tabs 
            value={relatorioHook.currentTab}
            onChange={(_, value) => {
                relatorioHook.setCurrentTab(value)
                relatorioHook.callbackSelectedTab(value);
            }}
            allowScrollButtonsMobile
            variant="scrollable"
            scrollButtons="auto"
            sx={{
                borderBottom: "1px solid",
                borderBottomColor: (theme) => theme.palette.divider
            }}    
        >
            {TABS.map((tab: any) =>
                <Tab
                    disableRipple
                    key={"TAB_"+tab.value+tab.label}
                    value={tab.value}
                    label={tab.label}
                    iconPosition="end"
                    icon={tab.icon &&
                        <Label
                            variant="filled"
                            sx={{
                                ml: 1
                            }}
                        >
                           {tab.icon}
                        </Label>

                    }
                />
            )}   

        </Tabs>
    )

} 