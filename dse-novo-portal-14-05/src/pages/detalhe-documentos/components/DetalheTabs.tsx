import { Tab, Tabs } from "@mui/material";
import Label from "src/components/Label";

export default function SecondaryTabs({detalheDocumentosHook}: any) {
  const TABS = [
    { label: "Geral", value: 0 },
    { label: "Vencidos", value: 1 },
    { label: "A vencer", value: 2 },
    { label: "Favoritos", value: 3 },
  ];

  return (
    <Tabs
      value={detalheDocumentosHook.currentTab}
      onChange={(_, value) => {
        detalheDocumentosHook.setCurrentTab(value);
        detalheDocumentosHook.callSelectedTab(value);
      }}
      allowScrollButtonsMobile
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: "1px solid",
        borderBottomColor: (theme) => theme.palette.divider,
      }}
    >
      {TABS.map((tab: any) => (
        <Tab
          disableRipple
          key={"TAB_" + tab.value + tab.label}
          value={tab.value}
          label={tab.label}
          iconPosition="end"
          icon={
            tab.icon && (
              <Label
                variant="filled"
                sx={{
                  ml: 1,
                }}
              >
                {tab.icon}
              </Label>
            )
          }
        />
      ))}
    </Tabs>
  );
}
